import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PARENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, classLevel, salary, latitude, longitude } = body;

    if (!title || !subject || !classLevel || !salary || !latitude || !longitude) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create approx location by adding a small random offset (roughly ~500m to 1km)
    const approxLatitude = latitude + (Math.random() - 0.5) * 0.01;
    const approxLongitude = longitude + (Math.random() - 0.5) * 0.01;

    const job = await prisma.tuitionJob.create({
      data: {
        title,
        description: description || "",
        subject,
        classLevel,
        salary: parseInt(salary, 10),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        approxLatitude,
        approxLongitude,
        parentId: (session.user as any).id,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("JOB_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    let whereClause = {};
    if (parentId) {
      whereClause = { parentId };
    }

    const jobs = await prisma.tuitionJob.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("JOB_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
