import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "crypto";
// Wait, using bcrypt package for hashing, not crypto
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Re-verify the OTP just before modifying the database for strict security
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { email }
    });

    if (!resetRecord || resetRecord.otp !== otp || resetRecord.expiresAt < new Date()) {
      return new NextResponse("Invalid or expired OTP. Please request a new one.", { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    // Run transaction to update password and delete the token simultaneously
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.delete({
        where: { email }
      })
    ]);

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
