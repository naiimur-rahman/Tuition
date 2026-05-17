import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pendingProfiles = await prisma.profile.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(pendingProfiles);
  } catch (error) {
    console.error("ADMIN_GET_VERIFY_ERROR", error);
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
    const { profileId, status } = body;

    if (!profileId || !status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: { verificationStatus: status },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("ADMIN_PATCH_VERIFY_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
