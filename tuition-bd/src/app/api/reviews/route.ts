import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PARENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { targetId, rating, comment } = body;

    if (!targetId || !rating) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating, 10),
        comment: comment || "",
        authorId: (session.user as any).id,
        targetId,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("REVIEW_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetId = searchParams.get("targetId");

        if (!targetId) {
            return new NextResponse("Target ID required", { status: 400 });
        }

        const reviews = await prisma.review.findMany({
            where: { targetId },
            include: {
                author: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("REVIEW_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
