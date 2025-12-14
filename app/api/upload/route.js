import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import streamifier from "streamifier";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "krisiconnect" },
        (error, uploadResult) => {
          if (error) return reject(error);
          return resolve(uploadResult);
        }
      );

      streamifier.createReadStream(buffer).pipe(stream);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id }, { status: 201 });
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    return NextResponse.json({ message: "Upload failed", error: String(error) }, { status: 500 });
  }
}
