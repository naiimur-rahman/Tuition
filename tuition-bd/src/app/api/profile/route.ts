import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    let extraData = {};
    if (user?.role === "TUTOR") {
      const confirmedJobsCount = await prisma.tuitionJob.count({
        where: {
          tutorId: userId,
          status: {
            in: ["ASSIGNED", "COMPLETED"],
          },
        },
      });

      const reviews = await prisma.review.findMany({
        where: {
          targetId: userId,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const averageRating = reviews.length > 0
        ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0.0;

      extraData = {
        hasConfirmedTuition: confirmedJobsCount > 0 || reviews.length > 0,
        reviews,
        averageRating,
      };
    } else if (user?.role === "PARENT") {
      const assignedJobs = await prisma.tuitionJob.findMany({
        where: {
          parentId: userId,
          tutorId: { not: null },
          status: {
            in: ["ASSIGNED", "COMPLETED"],
          },
        },
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const assignedTutorsMap = new Map();
      assignedJobs.forEach((job) => {
        if (job.tutor) {
          assignedTutorsMap.set(job.tutor.id, {
            id: job.tutor.id,
            name: job.tutor.name,
            jobTitle: job.title,
          });
        }
      });

      const assignedTutors = Array.from(assignedTutorsMap.values());

      extraData = {
        hasAssignedTutor: assignedTutors.length > 0,
        assignedTutors,
      };
    }

    return NextResponse.json({
      ...(profile || {}),
      ...extraData,
    });
  } catch (error) {
    console.error("GET_PROFILE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { 
      phone, 
      address, 
      bio, 
      education,
      latitude: reqLat,
      longitude: reqLng,
      actualLatitude: reqActualLat,
      actualLongitude: reqActualLng
    } = body;

    let latitude = reqLat !== undefined && reqLat !== null ? parseFloat(reqLat) : undefined;
    let longitude = reqLng !== undefined && reqLng !== null ? parseFloat(reqLng) : undefined;
    let actualLatitude = reqActualLat !== undefined && reqActualLat !== null ? parseFloat(reqActualLat) : undefined;
    let actualLongitude = reqActualLng !== undefined && reqActualLng !== null ? parseFloat(reqActualLng) : undefined;

    let approxLatitude = undefined;
    let approxLongitude = undefined;

    if (latitude !== undefined) {
      approxLatitude = latitude + (Math.random() - 0.5) * 0.008;
    }
    if (longitude !== undefined) {
      approxLongitude = longitude + (Math.random() - 0.5) * 0.008;
    }

    if (address && latitude === undefined) {
      latitude = 23.8103 + (Math.random() - 0.5) * 0.08;
      longitude = 90.4125 + (Math.random() - 0.5) * 0.08;
      approxLatitude = latitude + (Math.random() - 0.5) * 0.008;
      approxLongitude = longitude + (Math.random() - 0.5) * 0.008;
    }

    const profile = await prisma.profile.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId,
        phone: phone || null,
        address: address || null,
        bio: bio || null,
        education: education || null,
        latitude: latitude || 23.8103,
        longitude: longitude || 90.4125,
        approxLatitude: approxLatitude || 23.8103,
        approxLongitude: approxLongitude || 90.4125,
        actualLatitude,
        actualLongitude,
      },
      update: {
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        bio: bio !== undefined ? bio : undefined,
        education: education !== undefined ? education : undefined,
        ...(latitude !== undefined ? { latitude, longitude, approxLatitude, approxLongitude } : {}),
        ...(actualLatitude !== undefined ? { actualLatitude, actualLongitude } : {}),
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("POST_PROFILE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
