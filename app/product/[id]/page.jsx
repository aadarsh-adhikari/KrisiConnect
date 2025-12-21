import ConnectDB from '@/lib/connect';
import Product from '@/app/models/product';
import User from '@/app/models/user';
import ProductDetailClient from '@/app/components/ProductDetailClient';

export default async function ProductPage({ params }) {
  const { id } = await params;
  try {
    await ConnectDB();
    const product = await Product.findById(id).lean();
    if (!product) return <div className="p-8">Product not found</div>;
    // limit images to 7 on the server side
    product.images = (product.images || []).slice(0, 7);

    // populate seller name (if available)
    if (product.sellerId) {
      try {
        const seller = await User.findById(product.sellerId).lean();
        if (seller) {
          product.seller = { _id: seller._id.toString(), name: seller.name, email: seller.email, contact: seller.contact || null };
        }
      } catch (err) {
        console.warn('Failed to load seller for product', product._id, err);
      }
    }

    // Convert mongoose ObjectIds and Dates to plain values to avoid passing complex objects to client
    if (product.sellerId) {
      try {
        product.sellerId = product.sellerId.toString();
      } catch (e) {
        // already a string or not convertible
      }
    }
    if (product.createdAt) {
      try {
        product.createdAt = (product.createdAt instanceof Date) ? product.createdAt.toISOString() : new Date(product.createdAt).toISOString();
      } catch (e) {
        // leave as is
      }
    }

    // convert _id to string for client
    product._id = product._id.toString();
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <ProductDetailClient product={product} />
        </div>
      </div>
    );
  } catch (err) {
    console.error(err);
    return <div className="p-8">Error loading product</div>;
  }
}