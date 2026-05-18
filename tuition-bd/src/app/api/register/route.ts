import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      address, 
      bio, 
      education, 
      nidImageUrl,
      universityIdImageUrl,
      selfieImageUrl,
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

    if (!name || !email || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }

    if (role === "TUTOR") {
      if (!nidImageUrl || !universityIdImageUrl || !selfieImageUrl) {
        return new NextResponse("Tutors must upload National ID, Student ID, and Tutor Picture.", { status: 400 });
      }
    }

    if (phone) {
      const blacklisted = await prisma.blacklist.findUnique({
        where: { phone }
      });
      if (blacklisted) {
        return new NextResponse("This phone number has been blacklisted and cannot be registered.", { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let latitude = reqLat !== undefined && reqLat !== null ? parseFloat(reqLat) : null;
    let longitude = reqLng !== undefined && reqLng !== null ? parseFloat(reqLng) : null;
    let actualLatitude = reqActualLat !== undefined && reqActualLat !== null ? parseFloat(reqActualLat) : null;
    let actualLongitude = reqActualLng !== undefined && reqActualLng !== null ? parseFloat(reqActualLng) : null;

    if (!latitude && address) {
      // Centered on Dhaka with mild scattering to populate on map
      latitude = 23.8103 + (Math.random() - 0.5) * 0.08;
      longitude = 90.4125 + (Math.random() - 0.5) * 0.08;
    }

    let approxLatitude = latitude ? latitude + (Math.random() - 0.5) * 0.008 : null;
    let approxLongitude = longitude ? longitude + (Math.random() - 0.5) * 0.008 : null;

    // Set verification based on NID uploaded during tutor sign up
    const verificationStatus = role === "TUTOR" && nidImageUrl ? "PENDING" : "UNVERIFIED";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "PARENT",
        profile: {
          create: {
            phone: phone || null,
            address: address || null,
            bio: bio || null,
            education: education || null,
            nidImageUrl: nidImageUrl || null,
            universityIdImageUrl: universityIdImageUrl || null,
            selfieImageUrl: selfieImageUrl || null,
            gender: gender || null,
            studentClass: studentClass || null,
            hoursRequired: hoursRequired || null,
            tutorGenderPreference: tutorGenderPreference || null,
            salary: salary || null,
            numberOfChildren: numberOfChildren || null,
            verificationStatus,
            latitude,
            longitude,
            approxLatitude,
            approxLongitude,
            actualLatitude,
            actualLongitude,
          }
        }
      },
      include: {
        profile: true,
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.log("REGISTRATION_ERROR", error);
    require('fs').writeFileSync('/tmp/register-error.log', error?.stack || error?.toString() || 'Unknown error');
    return new NextResponse("Internal Error", { status: 500 });
  }
}
