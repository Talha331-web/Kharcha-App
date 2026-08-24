import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  ink: "#0E3B2E",
  inkLight: "#175A44",
  gold: "#D9A441",
  goldDark: "#9C7420",
  bg: "#F3F6F3",
  card: "#FFFFFF",
  textDark: "#1F2A24",
  textMuted: "#6B7A72",
  border: "#E3E8E4",
};

function friendlyError(err) {
  if (err?.code === "ECONNABORTED")
    return "The server did not respond in time. Please check that the backend is running and your phone is on the same WiFi network.";
  if (err?.message === "Network Error")
    return "Could not reach the server. Please check the IP address in the app settings and your WiFi connection.";
  return err?.response?.data?.message || "Something went wrong. Please try again.";
}

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Missing information", "Please fill in all fields");
    if (password.length < 6) return Alert.alert("Weak password", "Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      Alert.alert("Registration failed", friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="person-add" size={24} color={COLORS.ink} />
          </View>
          <Text style={styles.brand}>Kharcha</Text>
          <View style={styles.rule} />
          <Text style={styles.subtitle}>Create an account to get started</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign Up</Text>

          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={19} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#9AA5A0"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={19} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9AA5A0"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={19} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password (at least 6 characters)"
              placeholderTextColor="#9AA5A0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={19}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.ink} />
            ) : (
              <>
                <Text style={styles.buttonText}>Sign Up</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.ink} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.linkWrap}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkAccent}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: {
    backgroundColor: COLORS.ink,
    paddingTop: 72,
    paddingBottom: 56,
    alignItems: "center",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  rule: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#C9DAD1",
  },
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 22,
    marginTop: -34,
    borderRadius: 22,
    padding: 24,
    shadowColor: "#0E3B2E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 18,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.3,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#FBFCFB",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15.5,
    color: COLORS.textDark,
  },
  button: {
    flexDirection: "row",
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    shadowColor: COLORS.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: COLORS.ink, fontWeight: "700", fontSize: 16 },
  linkWrap: { marginTop: 22, alignItems: "center" },
  linkText: { color: COLORS.textMuted, fontSize: 14 },
  linkAccent: { color: COLORS.inkLight, fontWeight: "700" },
});
