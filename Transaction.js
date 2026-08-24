const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["debit", "credit"], required: true }, // spent or received
    category: {
      type: String,
      enum: [
        "Food",
        "Shopping",
        "Bills",
        "Transport",
        "Transfer",
        "Mobile Load",
        "Salary",
        "ATM Withdrawal",
        "Other",
      ],
      default: "Other",
    },
    merchant: { type: String, default: "" }, // extracted merchant/beneficiary name if available
    bank: { type: String, default: "" }, // e.g. HBL, Meezan, Easypaisa, JazzCash
    rawSms: { type: String, required: true }, // original SMS text, kept for user reference/edit
    source: { type: String, enum: ["sms_share", "manual"], default: "manual" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
