import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const subject = searchParams.get("subject");
    const classLevel = searchParams.get("classLevel");

    // 1. Single Job Query Support
    if (jobId) {
      const job = await prisma.tuitionJob.findUnique({
        where: { id: jobId },
        include: {
          parent: {
            select: {
              name: true,
              email: true,
              profile: {
                select: {
                  verificationStatus: true,
                  address: true,
                  gender: true,
                  preferable_time: true,
                  hoursRequired: true,
                  tutorGenderPreference: true,
                  numberOfChildren: true,
                }
              }
            }
          }
        }
      });
      return NextResponse.json(job);
    }

    const where: any = { status: "OPEN" };
    const mine = searchParams.get("mine");

    // Filter subject if specific
    if (subject && subject !== "All Subjects" && subject !== "Any") {
      where.subject = { contains: subject };
    }
    
    // Filter classLevel if specific
    if (classLevel && classLevel !== "Any") {
      where.classLevel = { contains: classLevel };
    }

    const jobs = await prisma.tuitionJob.findMany({
      where,
      include: {
        parent: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                verificationStatus: true,
                address: true,
                gender: true,
                preferable_time: true,
                hoursRequired: true,
                tutorGenderPreference: true,
                numberOfChildren: true,
              }
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Return only this parent's own jobs when mine=true
    if (mine === "true" && userId) {
      const myJobs = await prisma.tuitionJob.findMany({
        where: { parentId: userId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(myJobs);
    }

    // Securely sanitize exact addresses/coordinates unless unlocked or the current user is the owner
    const sanitizedJobs = jobs.map((job) => {
      const isOwner = userId && job.parentId === userId;
      const isUnlocked = job.locationUnlocked;
      const fullAddress = job.parent?.profile?.address || "Bangladesh";
      const parentVerificationStatus = job.parent?.profile?.verificationStatus || "UNVERIFIED";
      
      let shortAddress = fullAddress;
      const parts = fullAddress.split(",");
      if (parts.length > 2) {
        shortAddress = parts[parts.length - 2].trim();
      } else if (parts.length > 1) {
        shortAddress = parts[0].trim();
      }
      if (shortAddress.length > 22) {
        shortAddress = shortAddress.substring(0, 22);
      }

      if (isOwner || isUnlocked) {
        return {
          ...job,
          approxLat: job.latitude,
          approxLng: job.longitude,
          verified: parentVerificationStatus === "VERIFIED",
          address: fullAddress,
          parent: {
            name: job.parent?.name || "Parent",
            email: job.parent?.email || "",
            verificationStatus: parentVerificationStatus,
            gender: job.parent?.profile?.gender || null,
            preferable_time: job.parent?.profile?.preferable_time || null,
            hoursRequired: job.parent?.profile?.hoursRequired || null,
            tutorGenderPreference: job.parent?.profile?.tutorGenderPreference || null,
            numberOfChildren: job.parent?.profile?.numberOfChildren || "1",
          }
        };
      }

      return {
        ...job,
        latitude: null,
        longitude: null,
        approxLat: job.approxLatitude || 23.8103,
        approxLng: job.approxLongitude || 90.4125,
        verified: parentVerificationStatus === "VERIFIED",
        address: shortAddress,
        parent: {
          name: "Parent [Masked]",
          email: "masked@tuition-console.net",
          verificationStatus: parentVerificationStatus,
          gender: job.parent?.profile?.gender || null,
          preferable_time: job.parent?.profile?.preferable_time || null,
          hoursRequired: job.parent?.profile?.hoursRequired || null,
          tutorGenderPreference: job.parent?.profile?.tutorGenderPreference || null,
          numberOfChildren: job.parent?.profile?.numberOfChildren || "1",
        }
      };
    });

    return NextResponse.json(sanitizedJobs);
  } catch (error) {
    console.error("GET_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, classLevel, salary, latitude, longitude, tutorRequirement } = body;

    if (!title || !subject || !classLevel || !salary) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lat = parseFloat(latitude) || 23.8103;
    const lng = parseFloat(longitude) || 90.4125;

    // Generate blurred approximate coordinates within ~800 meters of the original coordinate
    const latOffset = (Math.random() - 0.5) * 0.008;
    const lngOffset = (Math.random() - 0.5) * 0.008;
    const approxLatitude = lat + latOffset;
    const approxLongitude = lng + lngOffset;

    const job = await prisma.tuitionJob.create({
      data: {
        title,
        description: description || "",
        subject,
        classLevel,
        salary: parseInt(salary),
        parentId: (session.user as any).id,
        latitude: lat,
        longitude: lng,
        approxLatitude,
        approxLongitude,
        tutorRequirement: tutorRequirement || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("POST_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { jobId, action } = body;

    if (action === "apply") {
      const job = await prisma.tuitionJob.findUnique({
        where: { id: jobId },
        include: {
          parent: {
            select: {
              profile: {
                select: {
                  tutorGenderPreference: true,
                }
              }
            }
          }
        }
      });

      if (!job) {
        return new NextResponse("Job not found", { status: 404 });
      }

      const tutorProfile = await prisma.profile.findUnique({
        where: { userId: userId },
        select: {
          gender: true,
        }
      });

      if (job.parent?.profile?.tutorGenderPreference === "Female" && tutorProfile?.gender === "Male") {
        return new NextResponse("Gender Mismatch: This tuition post requires a female tutor.", { status: 400 });
      }

      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          tutorId: userId,
          status: "ASSIGNED", // Assign status on application directly
        }
      });
      return NextResponse.json(updatedJob);
    }

    if (action === "request") {
      const { tutorId } = body;
      if (!tutorId) {
        return new NextResponse("Tutor ID is required", { status: 400 });
      }

      // Ensure the logged-in user is a PARENT
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      if (user?.role !== "PARENT") {
        return new NextResponse("Forbidden: Only Guardians can request tutors", { status: 403 });
      }

      // Ensure the job exists and belongs to this parent
      const job = await prisma.tuitionJob.findUnique({
        where: { id: jobId }
      });
      if (!job) {
        return new NextResponse("Job not found", { status: 404 });
      }
      if (job.parentId !== userId) {
        return new NextResponse("Forbidden: You do not own this job post", { status: 403 });
      }

      // Check if tutor exists
      const tutor = await prisma.user.findUnique({
        where: { id: tutorId }
      });
      if (!tutor || tutor.role !== "TUTOR") {
        return new NextResponse("Tutor not found", { status: 404 });
      }

      // Update the job with tutorId and status = "REQUESTED"
      const updatedJob = await prisma.tuitionJob.update({
        where: { id: jobId },
        data: {
          tutorId,
          status: "REQUESTED"
        }
      });

      // Send email notification to tutor
      if (tutor.email) {
        try {
          const transporter = (await import("nodemailer")).createTransport({
            service: "gmail",
            auth: {
              user: process.env.SMTP_EMAIL,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          const mailOptions = {
            from: `"TutorHire" <${process.env.SMTP_EMAIL}>`,
            to: tutor.email,
            subject: "New Tuition Direct Request - TutorHire",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 10px; border: 1px solid #1e293b;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #10b981; margin: 0;">TutorHire</h2>
                  <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Direct Request Notification</p>
                </div>
                
                <div style="background-color: #020617; padding: 30px; border-radius: 8px; border: 1px solid #1e293b;">
                  <p style="margin-bottom: 10px; font-size: 14px; color: #cbd5e1;">A Guardian has directly requested you for a tuition assignment:</p>
                  <h3 style="color: #10b981; margin-top: 15px;">Tuition Code: TCT-${String(job.jobSeq).padStart(3, '0')}</h3>
                  <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-top: 10px;">Subject: <strong>${job.subject}</strong></p>
                  <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">Class: <strong>${job.classLevel}</strong></p>
                  <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 15px;">Please log in to your Tutor Dashboard to accept the request.</p>
                </div>
              </div>
            `,
          };

          if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
            await transporter.sendMail(mailOptions);
          } else {
            console.log(`\n\n========================================`);
            console.log(`📨 DIRECT TUITION REQUEST EMAIL 📨`);
            console.log(`To: ${tutor.email}`);
            console.log(`Job ID: ${job.id}`);
            console.log(`========================================\n\n`);
          }
        } catch (mailErr) {
          console.error("Failed to send request email", mailErr);
        }
      }

      return NextResponse.json(updatedJob);
    }

    if (action === "accept") {
      const { paymentType } = body;
      if (!paymentType) {
        return new NextResponse("Payment type is required", { status: 400 });
      }

      // Ensure the job exists and matches the tutorId
      const job = await prisma.tuitionJob.findUnique({
        where: { id: jobId }
      });
      if (!job) {
        return new NextResponse("Job not found", { status: 404 });
      }
      if (job.tutorId !== userId) {
        return new NextResponse("Forbidden: You are not assigned to this job", { status: 403 });
      }

      if (paymentType === "instant") {
        const crypto = await import("crypto");
        // Unlock immediately: status = ASSIGNED, locationUnlocked = true
        const updatedJob = await prisma.tuitionJob.update({
          where: { id: jobId },
          data: {
            status: "ASSIGNED",
            locationUnlocked: true
          }
        });

        // Create successful Payment record representing the instant commission checkout
        await prisma.payment.create({
          data: {
            amount: Math.floor(job.salary * 0.2),
            status: "SUCCESS",
            type: "SALARY_COMMISSION",
            trxId: `INST-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
            jobId: jobId,
            tutorId: userId,
          }
        });

        return NextResponse.json(updatedJob);
      } else {
        // Pay Later: status = ASSIGNED, locationUnlocked = false
        const updatedJob = await prisma.tuitionJob.update({
          where: { id: jobId },
          data: {
            status: "ASSIGNED",
            locationUnlocked: false
          }
        });

        return NextResponse.json(updatedJob);
      }
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("PATCH_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) return new NextResponse("Job ID required", { status: 400 });

    // Ensure the requester owns the job
    const job = await prisma.tuitionJob.findUnique({ where: { id: jobId } });
    if (!job || job.parentId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.tuitionJob.delete({ where: { id: jobId } });
    return NextResponse.json({ message: "Job deleted" });
  } catch (error) {
    console.error("DELETE_JOBS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
