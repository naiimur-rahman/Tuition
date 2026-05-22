import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tuitionId = searchParams.get("tuition_id")?.trim();

    if (!tuitionId) {
      return new NextResponse("Tuition ID parameter is required", { status: 400 });
    }

    // Try parsing a numeric sequence from input
    // E.g., "TCT-001", "001", "1"
    let parsedJobSeq: number | null = null;
    const match = tuitionId.match(/TCT-(\d+)/i);
    if (match) {
      parsedJobSeq = parseInt(match[1], 10);
    } else {
      const numericMatch = tuitionId.match(/^\d+$/);
      if (numericMatch) {
        parsedJobSeq = parseInt(tuitionId, 10);
      }
    }

    const job = await prisma.tuitionJob.findFirst({
      where: {
        OR: [
          ...(parsedJobSeq !== null ? [{ jobSeq: parsedJobSeq }] : []),
          { id: tuitionId }
        ]
      },
      include: {
        parent: {
          include: {
            profile: true
          }
        },
        tutor: {
          include: {
            profile: true
          }
        },
        payments: true
      }
    });

    if (!job) {
      return new NextResponse("Tuition post not found", { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("ADMIN_SEARCH_TUITION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
