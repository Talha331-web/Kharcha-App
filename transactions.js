const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const { parseSms } = require("../utils/smsParser");

// All routes below require a logged-in user
router.use(auth);

// POST /api/transactions/preview-sms
// Body: { text: "raw sms text" }
// Parses the SMS WITHOUT saving — used to show a confirm/edit screen to the user first
router.post("/preview-sms", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "SMS text is required" });

    const parsed = parseSms(text);
    if (!parsed) {
      return res.status(422).json({
        message: "Couldn't detect a transaction amount in this message. You can add it manually instead.",
      });
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/transactions/parse-sms
// Body: { text: "raw sms text" }
// Parses the SMS and saves it as a transaction in one step (kept for cases where no confirm step is needed)
router.post("/parse-sms", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "SMS text is required" });

    const parsed = parseSms(text);
    if (!parsed) {
      return res.status(422).json({
        message: "Couldn't detect a transaction amount in this message. You can add it manually instead.",
      });
    }

    const transaction = await Transaction.create({ ...parsed, user: req.userId });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/transactions
// Manual entry
router.post("/", async (req, res) => {
  try {
    const { amount, type, category, merchant, date } = req.body;
    if (!amount || !type) {
      return res.status(400).json({ message: "Amount and type are required" });
    }

    const transaction = await Transaction.create({
      user: req.userId,
      amount,
      type,
      category: category || "Other",
      merchant: merchant || "",
      bank: "",
      rawSms: "Manually added",
      source: "manual",
      date: date || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/transactions?month=2026-07
router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { user: req.userId };

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH /api/transactions/:id  (edit category/amount if auto-parse got it wrong)
router.patch("/:id", async (req, res) => {
  try {
    const updates = (({ amount, type, category, merchant }) => ({ amount, type, category, merchant }))(req.body);
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/transactions/summary?month=2026-07
// Returns total spent, total received, and spend-by-category breakdown
router.get("/summary/monthly", async (req, res) => {
  try {
    const { month } = req.query;
    const now = new Date();
    const [year, mon] = month ? month.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);

    const transactions = await Transaction.find({
      user: req.userId,
      date: { $gte: start, $lt: end },
    });

    const totalSpent = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
    const totalReceived = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);

    const byCategory = {};
    transactions
      .filter((t) => t.type === "debit")
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });

    res.json({ month: `${year}-${String(mon).padStart(2, "0")}`, totalSpent, totalReceived, byCategory, count: transactions.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
