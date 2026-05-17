import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "TUTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { idImageUrl } = body;

    if (!idImageUrl) {
      return new NextResponse("Missing ID Image URL", { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId },
        data: {
          nidImageUrl: idImageUrl,
          verificationStatus: "PENDING",
        },
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId,
          nidImageUrl: idImageUrl,
          verificationStatus: "PENDING",
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("VERIFY_REQUEST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
