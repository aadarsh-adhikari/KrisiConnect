import ConnectDB from '@/lib/connect';
import Order from '@/app/models/order';
import Product from '@/app/models/product';
import { NextResponse } from 'next/server';

const ALLOWED_SELLER_STATUSES = ['shipped', 'cancelled'];

export async function PATCH(request, { params }) {
  try {
    const { id: orderId } = await params;
    const requesterId = request.headers.get('x-requester-id');
    if (!requesterId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { status } = body;
    if (!status || !ALLOWED_SELLER_STATUSES.includes(status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 });

    await ConnectDB();
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    // Fetch product to verify the seller owns the product
    const product = await Product.findById(order.productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    if (product.sellerId.toString() !== requesterId) return NextResponse.json({ message: 'Forbidden: only product seller can update status' }, { status: 403 });

    // Enforce simple transitions: seller may set shipped or cancelled
    if (order.status === status) return NextResponse.json(order, { status: 200 });

    // Prevent seller from marking delivered (buyer should confirm)
    if (status === 'delivered') return NextResponse.json({ message: 'Seller cannot mark as delivered' }, { status: 400 });

    order.status = status;
    await order.save();
    return NextResponse.json(order, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}