/**
 * smsParser.js
 * Rule-based parser for common Pakistani bank/wallet SMS formats.
 * Extracts: amount, type (debit/credit), bank name, merchant (if present).
 *
 * NOTE: Bank SMS formats change over time and vary by bank. This covers
 * the most common patterns (HBL, Meezan, UBL, Easypaisa, JazzCash, generic).
 * Add more patterns to `bankPatterns` as you collect real sample SMS.
 */

// Detect which bank/wallet sent this SMS based on keywords
function detectBank(text) {
  const t = text.toLowerCase();
  if (t.includes("easypaisa")) return "Easypaisa";
  if (t.includes("jazzcash")) return "JazzCash";
  if (t.includes("hbl")) return "HBL";
  if (t.includes("meezan")) return "Meezan";
  if (t.includes("ubl")) return "UBL";
  if (t.includes("mcb")) return "MCB";
  if (t.includes("allied") || t.includes("abl")) return "Allied Bank";
  if (t.includes("bank alfalah") || t.includes("alfalah")) return "Bank Alfalah";
  if (t.includes("standard chartered")) return "Standard Chartered";
  return "Unknown";
}

// Extract the amount (handles "Rs.", "PKR", commas, decimals)
function extractAmount(text) {
  // Matches: Rs. 1,500.00 | PKR 2500 | Rs 1500/- etc.
  const match = text.match(/(?:rs\.?|pkr)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ""));
}

// Determine debit vs credit based on common keywords
function extractType(text) {
  const t = text.toLowerCase();
  const debitWords = ["debited", "spent", "withdrawn", "paid", "purchase", "sent", "deducted"];
  const creditWords = ["credited", "received", "deposited", "refund"];

  if (debitWords.some((w) => t.includes(w))) return "debit";
  if (creditWords.some((w) => t.includes(w))) return "credit";
  return "debit"; // default assumption — most SMS alerts are spends
}

// Try to pull a merchant / beneficiary name if the SMS mentions "at X" or "to X"
function extractMerchant(text) {
  // Non-greedy match, stops at the first date/keyword/punctuation boundary
  const atMatch = text.match(
    /(?:at|to)\s+([A-Za-z0-9&.\-'\s]{3,30}?)(?=\s+(?:on|via|dated|at\s+\d)|[.,\n]|\s+\d{1,2}[-\/][A-Za-z0-9]|$)/i
  );
  if (atMatch) return atMatch[1].trim();
  return "";
}

// Simple keyword-based auto-categorization (MVP — can be swapped for an AI API call later)
function categorize(text, merchant) {
  const t = (text + " " + merchant).toLowerCase();

  const rules = [
    { category: "Food", keywords: ["foodpanda", "restaurant", "cafe", "kfc", "mcdonald", "hardees", "food", "biryani", "pizza"] },
    { category: "Mobile Load", keywords: ["jazz", "ufone", "telenor", "zong", "load", "easyload", "topup", "top-up"] },
    { category: "Bills", keywords: ["bill", "electricity", "wapda", "lesco", "gas", "sui", "internet", "ptcl"] },
    { category: "Transport", keywords: ["careem", "uber", "indrive", "bykea", "fuel", "petrol"] },
    { category: "Shopping", keywords: ["daraz", "mall", "store", "shop", "outlet"] },
    { category: "ATM Withdrawal", keywords: ["atm", "withdrawal", "withdrawn"] },
    { category: "Salary", keywords: ["salary", "payroll"] },
    { category: "Transfer", keywords: ["transfer", "sent to", "raast", "ibft"] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.category;
  }
  return "Other";
}

/**
 * Main parse function
 * @param {string} smsText - raw SMS text shared/pasted by the user
 * @returns {object|null} parsed transaction fields, or null if it doesn't look like a bank SMS
 */
function parseSms(smsText) {
  if (!smsText || typeof smsText !== "string") return null;

  const amount = extractAmount(smsText);
  if (amount === null) {
    // Doesn't look like a transaction SMS (no amount found)
    return null;
  }

  const bank = detectBank(smsText);
  const type = extractType(smsText);
  const merchant = extractMerchant(smsText);
  const category = categorize(smsText, merchant);

  return {
    amount,
    type,
    bank,
    merchant,
    category,
    rawSms: smsText,
    source: "sms_share",
  };
}

module.exports = { parseSms, detectBank, extractAmount, extractType, extractMerchant, categorize };
