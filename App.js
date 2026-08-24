import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import AddTransactionScreen from "./screens/AddTransactionScreen";
import TransactionListScreen from "./screens/TransactionListScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0F9D58" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Sign Up" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Kharcha" }} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{ title: "Transaction Add Karein" }}
          />
          <Stack.Screen
            name="TransactionList"
            component={TransactionListScreen}
            options={{ title: "Sab Transactions" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
