import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const subject = searchParams.get("subject");
    const classLevel = searchParams.get("classLevel");

    // 1. Single Job Query Support
    if (jobId) {
      const job = await prisma.tuitionJob.findUnique({
        where: { id: jobId },
        include: {
          parent: {
            select: {
              name: true,
              email: true,
              profile: {
                select: {
                  verificationStatus: true,
                }
              }
            }
          }
        }
      });
      return NextResponse.json(job);
    }

    const where: any = { status: "OPEN" };
    const mine = searchParams.get("mine");

    // Filter subject if specific
    if (subject && subject !== "All Subjects" && subject !== "Any") {
      where.subject = { contains: subject };
    }
    
    // Filter classLevel if specific
    if (classLevel && classLevel !== "Any") {
      where.classLevel = { contains: classLevel };
    }

    const jobs = await prisma.tuitionJob.findMany({
      where,
      include: {
        parent: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                verificationStatus: true,
              }
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Return only this parent's own jobs when mine=true
    if (mine === "true" && userId) {
      const myJobs = await prisma.tuitionJob.findMany({
        where: { parentId: userId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(myJobs);
    }

    // Securely sanitize exact addresses/coordinates unless unlocked or the current user is the owner
    const sanitizedJobs = jobs.map((job) => {
      const isOwner = userId && job.parentId === userId;
      const isUnlocked = job.locationUnlocked;
      const parentVerificationStatus = job.parent?.profile?.verificationStatus || "UNVERIFIED";

      if (isOwner || isUnlocked) {
        return {
          ...job,
          approxLat: job.latitude,
          approxLng: job.longitude,
          verified: parentVerificationStatus === "VERIFIED",
          parent: {
            name: "undefined",
            email: "undefined@tuition-console.net",
            verificationStatus: parentVerificationStatus,
          }
        };
      }

      // Hide exact coordinates and return approximate ones
      return {
        ...job,
        latitude: null,
        longitude: null,
        approxLat: job.approxLatitude || 23.8103,
        approxLng: job.approxLongitude || 90.4125,
        verified: parentVerificationStatus === "VERIFIED",
        parent: {
          name: "undefined",
          email: "undefined@tuition-console.net",
          verificationStatus: parentVerificationStatus,
        }
      };
    });

    return NextResponse.json(sanitizedJobs);
  } catch (error) {
    console.error("GET_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, classLevel, salary, latitude, longitude } = body;

    if (!title || !subject || !classLevel || !salary) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lat = parseFloat(latitude) || 23.8103;
    const lng = parseFloat(longitude) || 90.4125;

    // Generate blurred approximate coordinates within ~800 meters of the original coordinate
    const latOffset = (Math.random() - 0.5) * 0.008;
    const lngOffset = (Math.random() - 0.5) * 0.008;
    const approxLatitude = lat + latOffset;
    const approxLongitude = lng + lngOffset;

    const job = await prisma.tuitionJob.create({
      data: {
        title,
        description: description || "",
        subject,
        classLevel,
        salary: parseInt(salary),
        parentId: (session.user as any).id,
        latitude: lat,
        longitude: lng,
        approxLatitude,
        approxLongitude,
        status: "OPEN",
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("POST_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { jobId, action } = body;

    if (action === "apply") {
      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          tutorId: userId,
          status: "OPEN", // Keep status as OPEN until matching payment is validated
        }
      });
      return NextResponse.json(updatedJob);
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("PATCH_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) return new NextResponse("Job ID required", { status: 400 });

    // Ensure the requester owns the job
    const job = await prisma.tuitionJob.findUnique({ where: { id: jobId } });
    if (!job || job.parentId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.tuitionJob.delete({ where: { id: jobId } });
    return NextResponse.json({ message: "Job deleted" });
  } catch (error) {
    console.error("DELETE_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
