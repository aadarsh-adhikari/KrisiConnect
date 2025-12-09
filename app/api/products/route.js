import ConnectDB from "@/lib/connect";
import Product from "@/app/models/product";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await ConnectDB();
    const url = new URL(req.url);
    const sellerId = url.searchParams.get("sellerId");
    let products;
    if (sellerId) {
      products = await Product.find({ sellerId });
    } else {
      products = await Product.find();
    }
    return NextResponse.json(products, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
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
