// FILE: mobile/app/(waiter)/_layout.tsx
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function WaiterLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#E8A020",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarBackground: () => <BlurView tint="light" intensity={95} style={{ flex: 1 }} />
      }}
    >
      <Tabs.Screen
        name="tables"
        options={{
          title: "Tables",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          href: null,
          title: "Menu"
        }}
      />
    </Tabs>
  );
}
