import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("No account found with that email address.", { status: 404 });
    }

    // Generate a secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Upsert the token to the database
    await prisma.passwordReset.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        email,
        otp,
        expiresAt,
      }
    });

    // Create nodemailer transport
    const transporter = (await import("nodemailer")).createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"TutorHire" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your Password Reset OTP - TutorHire",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 10px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #38bdf8; margin: 0;">TutorHire</h2>
            <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Security Verification</p>
          </div>
          
          <div style="background-color: #020617; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #1e293b;">
            <p style="margin-bottom: 10px; font-size: 14px; color: #cbd5e1;">Your One-Time Password (OTP) for resetting your account security key is:</p>
            <h1 style="font-size: 42px; font-family: monospace; letter-spacing: 8px; color: #38bdf8; margin: 15px 0;">${otp}</h1>
            <p style="font-size: 12px; color: #64748b; margin-top: 15px;">This code will expire in exactly 15 minutes.</p>
          </div>
          
          <div style="margin-top: 20px; font-size: 11px; color: #475569; text-align: center;">
            <p>If you did not request this code, please ignore this email. Your account remains secure.</p>
          </div>
        </div>
      `,
    };

    // If env vars are set, send the email. Otherwise, log it (fallback for local testing)
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`\n\n========================================`);
      console.log(`🔐 OTP PASSWORD RESET REQUEST 🔐`);
      console.log(`To: ${email}`);
      console.log(`Code: ${otp}`);
      console.log(`========================================\n\n`);
      console.warn("⚠️ SMTP_EMAIL or SMTP_PASSWORD not set in .env! Email was NOT actually sent.");
    }

    return NextResponse.json({ success: true, message: "OTP has been generated and sent." });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
