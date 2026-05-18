import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Run a tiny, ultra-fast query to keep the database active
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "success",
      message: "Database active and keep-alive ping successful!",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("KEEP_ALIVE_PING_ERROR", error);
    return new NextResponse("Keep-alive ping failed", { status: 500 });
  }
}
