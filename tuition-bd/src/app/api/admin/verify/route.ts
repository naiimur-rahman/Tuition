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
    const { profileId, status, rejectionReason } = body;

    if (!profileId || !status || !['VERIFIED', 'REJECTED'].includes(status)) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const currentProfile = await prisma.profile.findUnique({
      where: { id: profileId }
    });

    const updateData: any = {
      verificationStatus: status,
      rejectionReason: status === "REJECTED" ? (rejectionReason || "No reason specified by administrator.") : null,
      rejectedAt: status === "REJECTED" ? new Date() : null,
    };

    if (status === "VERIFIED" && currentProfile) {
      if (currentProfile.pendingBio) {
        updateData.bio = currentProfile.pendingBio;
        updateData.pendingBio = null;
      }
      if (currentProfile.pendingEducation) {
        updateData.education = currentProfile.pendingEducation;
        updateData.pendingEducation = null;
      }
    } else if (status === "REJECTED" && currentProfile) {
      updateData.pendingBio = null;
      updateData.pendingEducation = null;
    }

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: updateData,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("ADMIN_PATCH_VERIFY_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
