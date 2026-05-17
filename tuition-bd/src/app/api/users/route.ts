import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (role !== "TUTOR") {
      return new NextResponse("Invalid Request", { status: 400 });
    }

    const tutors = await prisma.user.findMany({
      where: {
        role: "TUTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
        receivedReviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(tutors);
  } catch (error) {
    console.error("GET_USERS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
