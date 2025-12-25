import { v2 as cloudinary } from "cloudinary";

// Support both uppercase and lowercase env var naming (Vercel UI sometimes shows lowercase keys)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.cloudinary_cloud_name || process.env.CLOUDINARY_URL?.match(/cloud_name=([^&]+)/)?.[1];
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || process.env.cloudinary_api_key;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || process.env.cloudinary_api_secret;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  // Avoid printing secrets; only indicate presence/absence for debugging
  console.warn('Cloudinary environment variables missing or incomplete. Expected: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

export default cloudinary;
