import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { transactionAPI } from "../services/api";

export default function TransactionListScreen() {
  const [transactions, setTransactions] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const { data } = await transactionAPI.list();
      setTransactions(data);
    } catch (err) {
      console.log("Load error", err.message);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete this transaction?", "This action cannot be undone", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await transactionAPI.remove(id);
          loadTransactions();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onLongPress={() => handleDelete(item._id)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.merchant}>{item.merchant || item.bank || "—"}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString("en-GB")}</Text>
      </View>
      <Text style={[styles.amount, item.type === "credit" ? styles.credit : styles.debit]}>
        {item.type === "credit" ? "+" : "-"} Rs. {item.amount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No transactions found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  category: { fontWeight: "700", color: "#222" },
  merchant: { color: "#666", fontSize: 13, marginTop: 2 },
  date: { color: "#999", fontSize: 12, marginTop: 2 },
  amount: { fontWeight: "700", fontSize: 15 },
  debit: { color: "#E53935" },
  credit: { color: "#0F9D58" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
