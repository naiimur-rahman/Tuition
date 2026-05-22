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

    // Query all users who are either TUTOR or PARENT
    const allUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ["TUTOR", "PARENT"],
        },
      },
      include: {
        profile: true,
        tuitionJobs: {
          where: {
            status: "OPEN"
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map users to a standard profile structure (with fallback values if profile is null)
    const allProfiles = allUsers.map((user) => {
      const profile = user.profile;
      return {
        id: profile?.id || `temp-${user.id}`, // fallback ID if profile doesn't exist yet
        userId: user.id,
        phone: profile?.phone || "",
        address: profile?.address || "",
        education: profile?.education || "",
        bio: profile?.bio || "",
        verificationStatus: profile?.verificationStatus || "UNVERIFIED",
        nidImageUrl: profile?.nidImageUrl || null,
        universityIdImageUrl: profile?.universityIdImageUrl || null,
        selfieImageUrl: profile?.selfieImageUrl || null,
        latitude: profile?.latitude ?? null,
        longitude: profile?.longitude ?? null,
        approxLatitude: profile?.approxLatitude ?? null,
        approxLongitude: profile?.approxLongitude ?? null,
        actualLatitude: profile?.actualLatitude ?? null,
        actualLongitude: profile?.actualLongitude ?? null,
        tutorSeq: profile?.tutorSeq ?? null,
        rejectionReason: profile?.rejectionReason || null,
        rejectedAt: profile?.rejectedAt || null,
        is_active: profile?.is_active ?? true,
        reactivationRequested: profile?.reactivationRequested ?? false,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          jobs: user.tuitionJobs || [],
        },
      };
    });

    return NextResponse.json(allProfiles);
  } catch (error) {
    console.error("ADMIN_GET_PROFILES_ERROR", error);
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
    const {
      profileId,
      name,
      email,
      phone,
      address,
      education,
      bio,
      latitude,
      longitude,
      verificationStatus,
      rejectionReason,
      is_active,
      reactivationRequested,
    } = body;

    if (!profileId) {
      return new NextResponse("Missing profile ID", { status: 400 });
    }

    // Resolve real userId if profile doesn't exist yet
    let userId = "";
    let targetProfile = null;

    if (profileId.startsWith("temp-")) {
      userId = profileId.replace("temp-", "");
      targetProfile = await prisma.profile.findUnique({
        where: { userId },
      });
    } else {
      targetProfile = await prisma.profile.findUnique({
        where: { id: profileId },
      });
      if (targetProfile) {
        userId = targetProfile.userId;
      } else {
        return new NextResponse("Profile not found", { status: 404 });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update User records (Name / Email)
      const userUpdateData: any = {};
      if (name !== undefined) userUpdateData.name = name;
      if (email !== undefined) userUpdateData.email = email;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
        });
      }

      // 2. Upsert Profile records
      const profileUpdateData: any = {
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        education: education !== undefined ? education : undefined,
        bio: bio !== undefined ? bio : undefined,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        verificationStatus: verificationStatus !== undefined ? verificationStatus : undefined,
        rejectionReason: verificationStatus === "REJECTED" ? (rejectionReason || "Documents could not be verified by administrator.") : null,
        rejectedAt: verificationStatus === "REJECTED" ? new Date() : null,
        is_active: is_active !== undefined ? is_active : undefined,
        reactivationRequested: reactivationRequested !== undefined ? reactivationRequested : undefined,
      };

      // Filter out undefined fields
      Object.keys(profileUpdateData).forEach(
        (key) => profileUpdateData[key] === undefined && delete profileUpdateData[key]
      );

      const profile = await tx.profile.upsert({
        where: { userId },
        create: {
          userId,
          phone: phone || null,
          address: address || null,
          education: education || null,
          bio: bio || null,
          latitude: latitude !== undefined ? parseFloat(latitude) : 23.8103,
          longitude: longitude !== undefined ? parseFloat(longitude) : 90.4125,
          approxLatitude: latitude !== undefined ? parseFloat(latitude) : 23.8103,
          approxLongitude: longitude !== undefined ? parseFloat(longitude) : 90.4125,
          verificationStatus: verificationStatus || "UNVERIFIED",
          rejectionReason: verificationStatus === "REJECTED" ? rejectionReason : null,
        },
        update: profileUpdateData,
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
      });

      return profile;
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("ADMIN_PATCH_PROFILES_ERROR", error);
    if (error.code === "P2002") {
      return new NextResponse("Email address is already in use by another account.", { status: 409 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
