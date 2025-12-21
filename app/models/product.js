import mongoose from "mongoose";
const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, default: 0 , min: 0, max: 5 },
    images: [{ type: String }],
    location: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;