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
    // allow either buyer or the seller to cancel
    const product = await Product.findById(order.productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const isBuyer = order.buyerId.toString() === requesterId;
    const isSeller = product.sellerId && product.sellerId.toString() === requesterId;
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Only allow cancellation before seller ships
    if (order.status !== 'pending') return NextResponse.json({ message: 'Order cannot be cancelled' }, { status: 400 });

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