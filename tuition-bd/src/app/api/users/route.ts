import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");

        const users = await prisma.user.findMany({
            where: role ? { role } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profile: true
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("USERS_GET_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
