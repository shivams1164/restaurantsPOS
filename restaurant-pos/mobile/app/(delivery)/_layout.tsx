// FILE: mobile/app/(delivery)/_layout.tsx
import { Stack } from "expo-router";

export default function DeliveryLayout() {
  return (
    <Stack>
      <Stack.Screen name="orders/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="orders/[id]"
        options={{
          title: "Delivery Detail",
          headerStyle: { backgroundColor: "#F7F5F2" },
          headerTintColor: "#1A1A1A"
        }}
      />
    </Stack>
  );
}
