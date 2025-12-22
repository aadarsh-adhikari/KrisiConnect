import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import streamifier from "streamifier";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // Quick sanity check for Cloudinary config to produce a clearer error
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary not configured: missing environment variables');
      return NextResponse.json({ message: 'Cloudinary credentials not configured on server' }, { status: 500 });
    }

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
    // Include the message in the JSON so clients can surface it during debugging
    console.error("Cloudinary upload failed", error?.message || error, error?.stack || 'no-stack');
    return NextResponse.json({ message: "Upload failed", error: error?.message || String(error) }, { status: 500 });
  }
}
