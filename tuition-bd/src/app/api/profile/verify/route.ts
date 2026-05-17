import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { idImageUrl } = body;

    if (!idImageUrl) {
      return new NextResponse("Missing Image URL", { status: 400 });
    }

    // Update the profile's NID/ID field and change verification status to PENDING
    const updatedProfile = await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        nidImageUrl: idImageUrl,
        verificationStatus: "PENDING",
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("PROFILE_VERIFY_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
