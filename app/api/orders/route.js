import ConnectDB from '@/lib/connect';
import Order from '@/app/models/order';
import Product from '@/app/models/product';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const sellerId = url.searchParams.get('sellerId');
    const userId = url.searchParams.get('userId');

    await ConnectDB();

    if (sellerId) {
      // return orders for products that belong to this seller
      const products = await Product.find({ sellerId }).select('_id').lean();
      const productIds = products.map((p) => p._id);
      const orders = await Order.find({ productId: { $in: productIds } }).sort({ orderDate: -1 }).lean();
      return NextResponse.json(orders, { status: 200 });
    }

    if (!userId) return NextResponse.json({ message: 'userId required' }, { status: 400 });

    const orders = await Order.find({ buyerId: userId }).sort({ orderDate: -1 }).lean();
    return NextResponse.json(orders, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const requesterId = request.headers.get('x-requester-id');
    if (!requesterId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { productId, quantity } = body;
    if (!productId || !quantity) return NextResponse.json({ message: 'productId and quantity required' }, { status: 400 });

    await ConnectDB();
    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    if ((product.quantity || 0) < quantity) return NextResponse.json({ message: 'Insufficient stock' }, { status: 400 });

    const totalPrice = product.price * quantity;
    const order = new Order({ buyerId: requesterId, productId, quantity, totalPrice, status: 'pending' });

    // decrement product stock to reserve items
    product.quantity = (product.quantity || 0) - quantity;
    if (product.quantity < 0) return NextResponse.json({ message: 'Insufficient stock' }, { status: 400 });
    await product.save();

    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: e.message || 'Server error' }, { status: 500 });
  }
}