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
    const { jobId, action, tutorId } = body;

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

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("ADMIN_PATCH_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
