import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return new NextResponse("Email and OTP are required", { status: 400 });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { email }
    });

    if (!resetRecord) {
      return new NextResponse("Invalid or expired OTP", { status: 400 });
    }

    // Verify OTP matches and has not expired
    if (resetRecord.otp !== otp || resetRecord.expiresAt < new Date()) {
      return new NextResponse("Invalid or expired OTP", { status: 400 });
    }

    // Return success to allow the frontend to proceed to the password reset step
    return NextResponse.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("VERIFY_OTP_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
