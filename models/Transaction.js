import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    gross_amount: { type: Number, required: true },
    first_name: String,
    email: String,
    transaction_status: { type: String, default: "pending" },
    payment_type: String
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);