import express from "express";
import {
  createTransaction,
  handleNotification,

} from "../midtrans.js";
//checkStatus
const router = express.Router();

// ===============================
// Endpoint buat transaksi
// ===============================
router.post("/create", createTransaction);

// ===============================
// Endpoint notifikasi dari Midtrans
// ===============================
router.post("/notification", handleNotification);

// ===============================
// Endpoint untuk cek status transaksi (opsional)
// ===============================
router.get("/status/:order_id", checkStatus);

export default router;