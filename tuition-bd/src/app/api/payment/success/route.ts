import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    const body = await request.json();
    const { jobId, trxId, amount } = body;

    if (!jobId || !trxId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // 1. Create a pending payment transaction record in the database
    const payment = await prisma.payment.create({
      data: {
        amount: parseInt(amount),
        status: "PENDING",
        type: "SALARY_COMMISSION",
        trxId: trxId,
        jobId: jobId,
        tutorId: userId,
      },
    });

    return NextResponse.json({ payment, message: "Transaction logged successfully in pending state." });
  } catch (error) {
    console.error("PAYMENT_SUCCESS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
