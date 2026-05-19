import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const jobs = await prisma.tuitionJob.findMany({
      include: {
        parent: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                phone: true,
              }
            }
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                tutorSeq: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("ADMIN_GET_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { jobId, action, tutorId, tutorRequirement } = body;

    if (!jobId) {
      return new NextResponse("Missing jobId", { status: 400 });
    }

    if (action === "assign") {
      if (!tutorId) {
        return new NextResponse("Missing tutorId", { status: 400 });
      }

      // Manually set status as ASSIGNED, keeping locationUnlocked = false (until matching payment is cleared)
      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          status: "ASSIGNED",
          tutorId: tutorId,
          locationUnlocked: false
        }
      });

      return NextResponse.json({ updatedJob, message: "Tutor assigned manually (Pay Later)." });
    }

    if (action === "release") {
      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          tutorDetailsReleased: true
        }
      });

      return NextResponse.json({ updatedJob, message: "Tutor details released successfully." });
    }

    if (action === "approve") {
      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          status: "OPEN",
          tutorRequirement: tutorRequirement !== undefined ? tutorRequirement : undefined
        }
      });

      return NextResponse.json({ updatedJob, message: "Tuition post approved successfully." });
    }

    if (action === "updateRequirement") {
      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          tutorRequirement: tutorRequirement !== undefined ? tutorRequirement : undefined
        }
      });

      return NextResponse.json({ updatedJob, message: "Tutor requirement updated successfully." });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("ADMIN_PATCH_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return new NextResponse("Missing jobId", { status: 400 });
    }

    await prisma.tuitionJob.delete({
      where: { id: jobId }
    });

    return NextResponse.json({ success: true, message: "Job post deleted successfully." });
  } catch (error) {
    console.error("ADMIN_DELETE_JOB_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
