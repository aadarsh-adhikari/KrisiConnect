import ConnectDB from "@/lib/connect";
import Product from "@/app/models/product";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    await ConnectDB();
    const params = await context.params;
    const { id } = params;
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(product, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Error fetching product" }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    await ConnectDB();
    const params = await context.params;
    const { id } = params;
    const data = await req.json();
    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Error updating product" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    await ConnectDB();
    const params = await context.params;
    const { id } = params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Error deleting product" }, { status: 500 });
  }
}
