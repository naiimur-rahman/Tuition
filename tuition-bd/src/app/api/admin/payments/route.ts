import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        job: {
          include: {
            parent: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Resolve tutor users for each payment manually since we stored tutorId as a string field
    const tutorIds = payments.map(p => p.tutorId).filter(Boolean) as string[];
    const tutors = await prisma.user.findMany({
      where: { id: { in: tutorIds } },
      select: { id: true, name: true, email: true }
    });
    
    const tutorMap = new Map(tutors.map(t => [t.id, t]));

    const paymentsWithTutors = payments.map(p => ({
      ...p,
      tutor: p.tutorId ? tutorMap.get(p.tutorId) || null : null
    }));

    return NextResponse.json(paymentsWithTutors);
  } catch (error) {
    console.error("ADMIN_GET_PAYMENTS_ERROR", error);
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
    const { paymentId, status } = body;

    if (!paymentId || !['SUCCESS', 'FAILED'].includes(status)) {
      return new NextResponse("Invalid request parameters", { status: 400 });
    }

    // Update payment transaction status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status }
    });

    if (status === "SUCCESS") {
      // Unlock tuition coordinates and assign the verified paying tutor to the parent listing
      if (updatedPayment.jobId) {
        await prisma.tuitionJob.update({
          where: { id: updatedPayment.jobId },
          data: {
            locationUnlocked: true,
            status: "ASSIGNED",
            tutorId: updatedPayment.tutorId
          }
        });
      }
    }

    return NextResponse.json({ updatedPayment, message: `Payment status updated to ${status}.` });
  } catch (error) {
    console.error("ADMIN_PATCH_PAYMENTS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
