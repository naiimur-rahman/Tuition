import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const blacklisted = await prisma.blacklist.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(blacklisted);
  } catch (error) {
    console.error("ADMIN_GET_BLACKLIST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing blacklist ID", { status: 400 });
    }

    await prisma.blacklist.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_DELETE_BLACKLIST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
