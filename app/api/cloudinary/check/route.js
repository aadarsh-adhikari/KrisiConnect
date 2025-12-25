import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!isCloudinaryConfigured) {
      return NextResponse.json({ ok: false, message: 'Cloudinary not configured on server' }, { status: 500 });
    }

    // Perform a lightweight API call to validate credentials (reads up to 1 resource)
    const result = await cloudinary.api.resources({ max_results: 1 });
    return NextResponse.json({ ok: true, message: 'Cloudinary credentials valid', resources: result.resources?.length ?? 0 }, { status: 200 });
  } catch (err) {
    console.error('Cloudinary check failed', err?.message || err);
    return NextResponse.json({ ok: false, message: err?.message || 'Cloudinary API error' }, { status: 500 });
  }
}
