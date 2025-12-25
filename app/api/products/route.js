import ConnectDB from "@/lib/connect";
import Product from "@/app/models/product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Better early check for missing config to give a clear error
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not set in environment')
      return NextResponse.json({ message: 'MONGODB_URI not set on server. Check your .env or environment configuration.' }, { status: 500 })
    }

    await ConnectDB();
    const url = new URL(req.url);
    const sellerId = url.searchParams.get("sellerId");
    let products;
    if (sellerId) {
      products = await Product.find({ sellerId }).populate('sellerId', 'name').lean();
    } else {
      products = await Product.find().populate('sellerId', 'name').lean();
    }

    // defensive: ensure products is an array
    if (!Array.isArray(products)) products = [];

    // expose sellerName for convenience in the frontend (handle string/object sellerId)
    products = products.map((p) => {
      const sellerName = p?.sellerId?.name || (typeof p.sellerId === 'string' ? p.sellerId : null);
      return { ...p, sellerName };
    });

    return NextResponse.json(products, { status: 200 });
  } catch (e) {
    console.error('PRODUCTS FETCH ERROR:', e);
    return NextResponse.json({ message: "Error fetching products", error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await ConnectDB();
    const data = await req.json();
    const product = new Product(data);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    console.log("PRODUCT CREATE ERROR:", e); // Log the real error
    return NextResponse.json({ message: "Error creating product", error: String(e) }, { status: 500 });
  }
}
