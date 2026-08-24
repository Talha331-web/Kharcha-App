import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { transactionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  // NOTE: SMS share-to-app auto-detect (expo-share-intent) is disabled for now.
  // It uses native code and only works in a custom dev-client build (expo prebuild + expo run:android),
  // not in Expo Go. Re-enable by restoring useShareIntentContext once you build with a dev client.
  const hasShareIntent = false;
  const shareIntent = null;
  const resetShareIntent = () => {};
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    try {
      const { data } = await transactionAPI.summary();
      setSummary(data);
    } catch (err) {
      console.log("Summary load error", err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [])
  );

  // Whenever the user shares a bank SMS into the app, this fires
  useEffect(() => {
    if (hasShareIntent && shareIntent?.text) {
      handleSharedSms(shareIntent.text);
    }
  }, [hasShareIntent, shareIntent]);

  const handleSharedSms = async (text) => {
    try {
      const { data: parsed } = await transactionAPI.previewSms(text);
      resetShareIntent();
      navigation.navigate("AddTransaction", { prefill: parsed, rawSms: text });
    } catch (err) {
      resetShareIntent();
      Alert.alert(
        "Couldn't understand this message",
        "This doesn't look like a transaction. You can add it manually instead.",
        [{ text: "Add manually", onPress: () => navigation.navigate("AddTransaction") }, { text: "Cancel" }]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>This month's spending</Text>
        <Text style={styles.summaryAmount}>Rs. {summary?.totalSpent?.toLocaleString() || 0}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summarySub}>Received: Rs. {summary?.totalReceived?.toLocaleString() || 0}</Text>
          <Text style={styles.summarySub}>{summary?.count || 0} transactions</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>By category</Text>
      {summary?.byCategory && Object.keys(summary.byCategory).length > 0 ? (
        Object.entries(summary.byCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amt]) => (
            <View key={cat} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat}</Text>
              <Text style={styles.categoryAmount}>Rs. {amt.toLocaleString()}</Text>
            </View>
          ))
      ) : (
        <Text style={styles.empty}>No transactions yet.</Text>
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddTransaction")}>
        <Text style={styles.addButtonText}>+ Add manually</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listButton} onPress={() => navigation.navigate("TransactionList")}>
        <Text style={styles.listButtonText}>View all transactions</Text>
      </TouchableOpacity>

      <View style={styles.hintBox}>
        <Text style={styles.hintText}>
          💡 Tip: When a bank SMS arrives, long-press the message in your Messages app → Share → select
          "Kharcha". The transaction will be detected automatically.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 14, color: "#666" },
  name: { fontSize: 20, fontWeight: "700", color: "#222" },
  logout: { color: "#E53935", fontWeight: "600" },
  summaryCard: { backgroundColor: "#0F9D58", borderRadius: 16, padding: 20, marginBottom: 24 },
  summaryLabel: { color: "#E8F5E9", fontSize: 14 },
  summaryAmount: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  summarySub: { color: "#E8F5E9", fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#222" },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  categoryName: { color: "#333" },
  categoryAmount: { color: "#333", fontWeight: "600" },
  empty: { color: "#999", fontStyle: "italic", marginBottom: 16 },
  addButton: {
    backgroundColor: "#0F9D58",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  listButton: { padding: 16, alignItems: "center" },
  listButtonText: { color: "#0F9D58", fontWeight: "600" },
  hintBox: { backgroundColor: "#FFF8E1", borderRadius: 10, padding: 14, marginTop: 10 },
  hintText: { color: "#7A5C00", fontSize: 13, lineHeight: 19 },
});
