import ConnectDB from '@/lib/connect';
import Order from '@/app/models/order';
import Product from '@/app/models/product';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id: orderId } = await params;
    const requesterId = request.headers.get('x-requester-id');
    if (!requesterId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await ConnectDB();
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    if (order.buyerId.toString() !== requesterId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    // Only allow buyer to cancel before seller ships
    if (order.status !== 'pending') return NextResponse.json({ message: 'Order cannot be cancelled' }, { status: 400 });

    const product = await Product.findById(order.productId);
    if (product) {
      product.quantity = (product.quantity || 0) + (order.quantity || 0);
      await product.save();
    }

    order.status = 'cancelled';
    await order.save();
    return NextResponse.json(order, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}