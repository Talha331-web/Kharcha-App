import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { transactionAPI } from "../services/api";

const CATEGORIES = [
  "Food",
  "Shopping",
  "Bills",
  "Transport",
  "Transfer",
  "Mobile Load",
  "Salary",
  "ATM Withdrawal",
  "Other",
];

export default function AddTransactionScreen({ route, navigation }) {
  // If opened from a shared SMS, prefilled data + rawSms text are passed via route.params
  const prefill = route.params?.prefill;
  const rawSms = route.params?.rawSms || "Manually added";

  const [amount, setAmount] = useState(prefill?.amount ? String(prefill.amount) : "");
  const [type, setType] = useState(prefill?.type || "debit");
  const [category, setCategory] = useState(prefill?.category || "Other");
  const [merchant, setMerchant] = useState(prefill?.merchant || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      return Alert.alert("Check the amount", "Please enter a valid amount");
    }
    setLoading(true);
    try {
      await transactionAPI.addManual({
        amount: Number(amount),
        type,
        category,
        merchant,
        rawSms,
        source: prefill ? "sms_share" : "manual",
      });
      Alert.alert("Saved", "Transaction added successfully", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {prefill && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Detected from SMS — please review before saving</Text>
        </View>
      )}

      <Text style={styles.label}>Amount (Rs.)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.pill, type === "debit" && styles.pillActiveDebit]}
          onPress={() => setType("debit")}
        >
          <Text style={type === "debit" ? styles.pillTextActive : styles.pillText}>Expense (Debit)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pill, type === "credit" && styles.pillActiveCredit]}
          onPress={() => setType("credit")}
        >
          <Text style={type === "credit" ? styles.pillTextActive : styles.pillText}>Income (Credit)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.categoryChip, category === c && styles.categoryChipActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={category === c ? styles.chipTextActive : styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Merchant / Note (optional)</Text>
      <TextInput style={styles.input} value={merchant} onChangeText={setMerchant} placeholder="e.g. KFC, Ali" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { backgroundColor: "#E8F5E9", padding: 12, borderRadius: 10, marginBottom: 16 },
  bannerText: { color: "#0F9D58", fontWeight: "600" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, fontSize: 16 },
  row: { flexDirection: "row", gap: 10 },
  pill: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, alignItems: "center" },
  pillActiveDebit: { backgroundColor: "#FFEBEE", borderColor: "#E53935" },
  pillActiveCredit: { backgroundColor: "#E8F5E9", borderColor: "#0F9D58" },
  pillText: { color: "#666" },
  pillTextActive: { fontWeight: "700", color: "#222" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  categoryChipActive: { backgroundColor: "#0F9D58", borderColor: "#0F9D58" },
  chipText: { color: "#555" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  saveButton: {
    backgroundColor: "#0F9D58",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
    marginBottom: 40,
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
