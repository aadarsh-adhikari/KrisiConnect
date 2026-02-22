import ConnectDB from '@/lib/connect';
import Order from '@/app/models/order';
import Product from '@/app/models/product';
import { NextResponse } from 'next/server';

const ALLOWED_SELLER_STATUSES = ['shipped', 'cancelled', 'delivered'];

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

    // Allow seller to move orders to shipped / cancelled / delivered (server-enforced list)
    if (order.status === status) return NextResponse.json(order, { status: 200 });

    // Note: buyers may still confirm delivered via the /confirm endpoint; allowing sellers to mark delivered
    // is a deliberate policy change to support seller-confirmation of delivery.

    // if seller cancels the order, increment product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      // fetch product and restore quantity
      const prod = await Product.findById(order.productId);
      if (prod) {
        prod.quantity = (prod.quantity || 0) + (order.quantity || 0);
        await prod.save();
      }
    }

    order.status = status;
    await order.save();
    return NextResponse.json(order, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}