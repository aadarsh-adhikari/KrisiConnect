import mongoose from "mongoose";
const orderSchema = mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
    orderDate: { type: Date, default: Date.now },
});
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;