import ConnectDB from '@/lib/connect';
import User from '@/app/models/user';
import Product from '@/app/models/product';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    await ConnectDB();
    const { id } = await params;
    const user = await User.findById(id).lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    // only expose limited fields
    const { name, contact, role, _id } = user;
    return NextResponse.json({ name, contact, role, _id }, { status: 200 });
  } catch (e) {
    console.error('USER GET ERROR:', e);
    return NextResponse.json({ message: 'Error fetching user', error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await ConnectDB();
    const { id } = await params; // params may be a Promise in Next.js app router
    const body = await req.json().catch(() => ({}));

    // Basic check: requesterId must match id (best effort - replace with real auth)
    const requesterId = body.requesterId || body.userId || req.headers.get('x-requester-id');

    if (!requesterId) {
      console.warn('DELETE /api/users/:id - missing requesterId', { paramsId: id, body });
      return NextResponse.json({ message: 'Missing requesterId in request body or x-requester-id header' }, { status: 400 });
    }

    if (requesterId !== id) {
      console.warn('DELETE /api/users/:id - unauthorized requester', { paramsId: id, requesterId });
      return NextResponse.json({ message: 'Unauthorized - requesterId does not match target user' }, { status: 401 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // If farmer, delete their products and their images from Cloudinary
    if (user.role === 'farmer') {
      const products = await Product.find({ sellerId: user._id });

      const extractPublicId = (url) => {
        if (!url) return null;
        // Already a public id (no protocol)
        if (!/^https?:\/\//i.test(url)) return url;
        try {
          const u = new URL(url);
          // Example path: /image/upload/v12345/krisiconnect/abcd.jpg
          const match = u.pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/i);
          if (!match || !match[1]) return null;
          let publicId = match[1];
          // Strip extension
          publicId = publicId.replace(/\.[a-z0-9]+$/i, '');
          return publicId;
        } catch (err) {
          return null;
        }
      };

      for (const p of products) {
        if (Array.isArray(p.images)) {
          for (const img of p.images) {
            const publicId = extractPublicId(img);
            if (publicId) {
              try {
                await cloudinary.uploader.destroy(publicId);
              } catch (err) {
                console.warn('Failed to delete cloudinary image', publicId, err.message || err);
              }
            }
          }
        }
      }

      await Product.deleteMany({ sellerId: user._id });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Account deleted' }, { status: 200 });
  } catch (e) {
    console.error('USER DELETE ERROR:', e);
    return NextResponse.json({ message: 'Error deleting account', error: String(e) }, { status: 500 });
  }
}