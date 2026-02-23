import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import streamifier from "streamifier";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // determine whether to upload to Cloudinary or store locally
    // only use Cloudinary when credentials exist *and* we are running in production
    const useCloudinary = isCloudinaryConfigured && process.env.NODE_ENV === 'production';
    if (useCloudinary) {
      try {
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
      } catch (cloudErr) {
        console.error("Cloudinary upload error", cloudErr);
        // fall through to error response below
        throw cloudErr;
      }
    }

    // Fallback: save file to local public/uploads directory when offline
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const extension = file.type.split("/")[1] || "bin";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filepath, buffer);

    // URL will be relative to the site root
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, publicId: null }, { status: 201 });
  } catch (error) {
    // Include the message in the JSON so clients can surface it during debugging
    console.error("Upload failed", error?.message || error, error?.stack || 'no-stack');
    const body = { message: "Upload failed" };
    if (error?.message) body.error = error.message;
    return NextResponse.json(body, { status: 500 });
  }
}
