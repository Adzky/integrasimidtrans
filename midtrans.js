import midtransClient from "midtrans-client";
//import Transaction from "./models/Transaction.js";

const snap = new midtransClient.Snap({
  isProduction: false, // ubah true kalau sudah live
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// ===============================
// 1️⃣ Buat Transaksi
// ===============================
export const createTransaction = async (req, res) => {
  try {
    const { amount, first_name, email } = req.body;

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: amount
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name,
        email
      }
    };

    console.log("ServerKey:", process.env.MIDTRANS_SERVER_KEY);
    console.log("ClientKey:", process.env.MIDTRANS_CLIENT_KEY);

    const transaction = await snap.createTransaction(parameter);

    res.status(200).json({
      message: "Transaksi berhasil dibuat",
      order_id: orderId,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error) {
    console.error("Error createTransaction:", error);
    res.status(500).json({ message: "Gagal membuat transaksi" });
  }
};

// ===============================
// 2️⃣ Handle Notification
// ===============================
export const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    // const {
    //   order_id,
    //   status_code,
    //   gross_amount,
    //   signature_key
    // } = notification;

    // // Generate signature lokal
    // const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // const hash = crypto
    //   .createHash("sha512")
    //   .update(order_id + status_code + gross_amount + serverKey)
    //   .digest("hex");

    // if (hash !== signature_key) {
    //   return res.status(403).json({ message: "Invalid signature" });
    // }

    const statusResponse = await coreApi.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log("Order ID:", orderId);
    console.log("Transaction Status:", transactionStatus);

    /*
      STATUS YANG MUNGKIN:
      - capture
      - settlement
      - pending
      - deny
      - cancel
      - expire
      - failure
    */

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        console.log("Pembayaran berhasil (capture)");
      }
    } else if (transactionStatus === "settlement") {
      console.log("Pembayaran berhasil (settlement)");
    } else if (transactionStatus === "pending") {
      console.log("Menunggu pembayaran");
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      console.log("Pembayaran gagal");
    }

    // Update status di MongoDB
    // await Transaction.findOneAndUpdate(
    //   { order_id },
    //   {
    //     transaction_status: transactionStatus,
    //     payment_type: paymentType
    //   }
    // );

    res.status(200).json({ message: "Notification handled", status: statusResponse });

  } catch (error) {
    console.error("Error handleNotification:", error);
    res.status(500).json({ message: "Error handling notification" });
  }
};

export const checkStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log("Checking order:", orderId);

    const statusResponse = await coreApi.transaction.status(orderId);

    res.status(200).json(statusResponse);

  } catch (error) {
    console.error("Midtrans Error:", error.ApiResponse || error);

    res.status(500).json({
      message: "Gagal cek status transaksi",
      error: error.ApiResponse || error.message
    });
  }
};

// export const checkStatus = async (req, res) => {
//   try {
//     const { order_id } = req.params;

//     const transaction = await Transaction.findOne({ order_id });

//     if (!transaction) {
//       return res.status(404).json({ message: "Order tidak ditemukan" });
//     }

//     res.json(transaction);

//   } catch (error) {
//     res.status(500).json({ message: "Error cek status" });
//   }
// };