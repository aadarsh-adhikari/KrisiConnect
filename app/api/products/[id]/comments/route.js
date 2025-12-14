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
    return NextResponse.json(product.comments || [], { status: 200 });
  } catch (e) {
    console.error("Error fetching comments:", e);
    return NextResponse.json({ message: "Error fetching comments" }, { status: 500 });
  }
}

export async function POST(req, context) {
  try {
    await ConnectDB();
    const params = await context.params;
    const { id } = params;
    const { comment, rating, user } = await req.json();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    const newComment = { user: user || "Anonymous", comment, rating, date: new Date() };
    product.comments = product.comments || [];
    product.comments.unshift(newComment);
    console.log("Before save, product.comments:", product.comments);
    await product.save();
    console.log("After save, product.comments:", product.comments);
    return NextResponse.json(newComment, { status: 201 });
  } catch (e) {
    console.error("Error posting comment:", e);
    return NextResponse.json({ message: "Error posting comment", error: e.message }, { status: 500 });
  }
}
