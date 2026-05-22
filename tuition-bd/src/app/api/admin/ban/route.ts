import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, reason } = body;

    if (!userId) {
      return new NextResponse("Missing user ID", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Add phone to blacklist if they have one
      if (user.profile && user.profile.phone) {
        // Upsert to handle edge cases where they might already be in the blacklist somehow
        await tx.blacklist.upsert({
          where: { phone: user.profile.phone },
          update: {
            name: user.name,
            email: user.email,
            role: user.role,
            reason: reason || "Banned by administrator",
          },
          create: {
            phone: user.profile.phone,
            name: user.name,
            email: user.email,
            role: user.role,
            reason: reason || "Banned by administrator",
          }
        });
      }

      // Delete the user (this cascades to profile, jobs, etc.)
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_BAN_USER_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
