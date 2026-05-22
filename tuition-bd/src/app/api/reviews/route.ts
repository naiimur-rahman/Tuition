import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const authorId = (session.user as any).id;
    const body = await request.json();
    const { targetId, rating, comment } = body;

    if (!targetId || !rating) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || "",
        authorId: authorId,
        targetId: targetId,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("POST_REVIEWS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
