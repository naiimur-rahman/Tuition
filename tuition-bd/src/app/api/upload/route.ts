import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context");

    if (!session && context !== "register" && context !== "dashboard" && context !== "tutor") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const filename = searchParams.get("filename") || `credential-${Date.now()}.jpg`;

    if (!request.body) {
      return new NextResponse("Missing file body", { status: 400 });
    }

    // Streams raw request body bytes straight to Vercel Object Storage
    const blob = await put(filename, request.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("BLOB_UPLOAD_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
