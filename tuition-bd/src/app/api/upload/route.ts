import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Convert raw request stream into a Blob
    let fileBlob = await request.blob();
    let finalFilename = filename;

    // Convert HEIC or HEIF files to JPEGs for browser rendering support
    const isHeic = filename.toLowerCase().endsWith(".heic") || filename.toLowerCase().endsWith(".heif");
    if (isHeic) {
      console.log("HEIC format detected! Converting to JPEG on the server...");
      try {
        const heicConvert = require("heic-convert");
        const arrayBuffer = await fileBlob.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        const outputBuffer = await heicConvert({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 0.8,
        });

        // Create a new Blob from the outputBuffer
        fileBlob = new Blob([outputBuffer], { type: "image/jpeg" });
        // Replace filename extension with .jpg
        finalFilename = filename.replace(/\.(heic|heif)$/i, ".jpg");
        console.log("HEIC conversion succeeded! Converted filename:", finalFilename);
      } catch (err) {
        console.error("HEIC conversion failed, proceeding with original file:", err);
      }
    }

    // 1. Prepare form data payload for Catbox permanent anonymous file uploader
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", fileBlob, finalFilename);

    // 2. Perform the multipart POST to Catbox's official upload API
    console.log("Starting secure Catbox document upload for filename:", filename);
    const postRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (!postRes.ok) {
      throw new Error(`Catbox uploader server failed with status: ${postRes.status}`);
    }

    // Catbox API directly returns the absolute hotlink URL as a plaintext string
    const directImageUrl = (await postRes.text()).trim();
    console.log("Catbox Upload Successful! Direct URL:", directImageUrl);

    if (!directImageUrl.startsWith("https://files.catbox.moe/")) {
      throw new Error(`Catbox returned an error response: ${directImageUrl}`);
    }

    // Return the identical response structure expected by the front-end clients
    return NextResponse.json({ url: directImageUrl });
  } catch (error: any) {
    console.error("CATBOX_UPLOAD_ERROR", error);
    return new NextResponse(error?.message || "Internal Server Error", { status: 500 });
  }
}
