import ConnectDB from '@/lib/connect';
import Order from '@/app/models/order';
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

    // Only allow buyer to confirm (mark delivered) if seller has marked it as shipped
    if (order.status === 'delivered') return NextResponse.json(order, { status: 200 });
    if (order.status !== 'shipped') return NextResponse.json({ message: 'Order must be shipped by seller before buyer can confirm' }, { status: 400 });

    order.status = 'delivered';
    await order.save();
    return NextResponse.json(order, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}