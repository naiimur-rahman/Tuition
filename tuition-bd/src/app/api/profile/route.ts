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
      const assignedJobs = await prisma.tuitionJob.findMany({
        where: {
          tutorId: userId,
        },
        include: {
          parent: {
            select: {
              name: true,
              email: true,
              profile: {
                select: {
                  phone: true,
                }
              }
            }
          },
          payments: {
            where: {
              tutorId: userId,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          }
        }
      });

      const confirmedJobsCount = assignedJobs.filter(j => j.status === "ASSIGNED" || j.status === "COMPLETED").length;

      const tutorJobs = assignedJobs.map(job => ({
        id: job.id,
        jobSeq: job.jobSeq,
        title: job.title,
        subject: job.subject,
        classLevel: job.classLevel,
        salary: job.salary,
        status: job.status,
        locationUnlocked: job.locationUnlocked,
        parent: job.locationUnlocked ? {
          name: job.parent.name,
          email: job.parent.email,
          phone: job.parent.profile?.phone || "Not specified",
          latitude: job.latitude,
          longitude: job.longitude,
        } : {
          name: "Unlocked Pending Match Payment",
          email: "hidden@tuition-console.net",
          phone: "hidden",
        },
        payment: job.payments[0] ? {
          amount: job.payments[0].amount,
          status: job.payments[0].status,
          trxId: job.payments[0].trxId,
          createdAt: job.payments[0].createdAt,
        } : null,
      }));

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

      const completedPayments = await prisma.payment.findMany({
        where: {
          tutorId: userId,
          status: "SUCCESS"
        },
        include: {
          job: {
            select: {
              jobSeq: true,
              title: true,
              subject: true,
              classLevel: true,
              salary: true,
              updatedAt: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      extraData = {
        hasConfirmedTuition: confirmedJobsCount > 0 || reviews.length > 0,
        reviews,
        averageRating,
        tutorJobs,
        paymentHistory: completedPayments,
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
              email: true,
              profile: {
                select: {
                  tutorSeq: true,
                  education: true,
                  phone: true,
                  selfieImageUrl: true,
                  universityIdImageUrl: true,
                },
              },
            },
          },
        },
      });

      const assignedTutorsMap = new Map();
      assignedJobs.forEach((job) => {
        if (job.tutor) {
          assignedTutorsMap.set(job.tutor.id, {
            id: job.tutor.id,
            name: job.tutor.name || "Tutor",
            email: job.tutor.email || "N/A",
            phone: job.tutor.profile?.phone || "Not specified",
            tutorSeq: job.tutor.profile?.tutorSeq || 1,
            education: job.tutor.profile?.education || "Not specified",
            jobTitle: job.title,
            selfieImageUrl: job.tutor.profile?.selfieImageUrl || null,
            universityIdImageUrl: job.tutor.profile?.universityIdImageUrl || null,
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
      bio: profile?.pendingBio || profile?.bio || null,
      education: profile?.pendingEducation || profile?.education || null,
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
      gender,
      studentClass,
      hoursRequired,
      tutorGenderPreference,
      salary,
      numberOfChildren,
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

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: userId },
    });

    const isCurrentlyVerified = existingProfile?.verificationStatus === "VERIFIED";

    let createData: any = {
      userId,
      phone: phone || null,
      address: address || null,
      bio: bio || null,
      education: education || null,
      gender: gender || null,
      studentClass: studentClass || null,
      hoursRequired: hoursRequired || null,
      tutorGenderPreference: tutorGenderPreference || null,
      salary: salary || null,
      numberOfChildren: numberOfChildren || null,
      latitude: latitude || 23.8103,
      longitude: longitude || 90.4125,
      approxLatitude: approxLatitude || 23.8103,
      approxLongitude: approxLongitude || 90.4125,
      actualLatitude,
      actualLongitude,
    };

    let updateData: any = {
      phone: phone !== undefined ? phone : undefined,
      address: address !== undefined ? address : undefined,
      gender: gender !== undefined ? gender : undefined,
      studentClass: studentClass !== undefined ? studentClass : undefined,
      hoursRequired: hoursRequired !== undefined ? hoursRequired : undefined,
      tutorGenderPreference: tutorGenderPreference !== undefined ? tutorGenderPreference : undefined,
      salary: salary !== undefined ? salary : undefined,
      numberOfChildren: numberOfChildren !== undefined ? numberOfChildren : undefined,
      ...(latitude !== undefined ? { latitude, longitude, approxLatitude, approxLongitude } : {}),
      ...(actualLatitude !== undefined ? { actualLatitude, actualLongitude } : {}),
    };

    if (isCurrentlyVerified) {
      if (bio !== undefined && bio !== existingProfile.bio) {
        updateData.pendingBio = bio;
        updateData.verificationStatus = "PENDING";
      }
      if (education !== undefined && education !== existingProfile.education) {
        updateData.pendingEducation = education;
        updateData.verificationStatus = "PENDING";
      }
    } else {
      if (bio !== undefined) updateData.bio = bio;
      if (education !== undefined) updateData.education = education;
    }

    const profile = await prisma.profile.upsert({
      where: {
        userId: userId,
      },
      create: createData,
      update: updateData,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("POST_PROFILE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
