import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { jobId, trxId, amount } = body;

    if (!jobId || !trxId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // 1. Create a successful payment transaction record in the database
    const payment = await prisma.payment.create({
      data: {
        amount: parseInt(amount) || 50,
        status: "SUCCESS",
        type: "UNLOCK_FEE",
        trxId: trxId,
        jobId: jobId,
      },
    });

    // 2. Mark locationUnlocked as true on the TuitionJob
    const updatedJob = await prisma.tuitionJob.update({
      where: {
        id: jobId,
      },
      data: {
        locationUnlocked: true,
      },
    });

    return NextResponse.json({ payment, updatedJob });
  } catch (error) {
    console.error("PAYMENT_SUCCESS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
