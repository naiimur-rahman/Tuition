import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing Info", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "PARENT",
        profile: {
          create: {
             // Create empty profile
          }
        }
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.log("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
