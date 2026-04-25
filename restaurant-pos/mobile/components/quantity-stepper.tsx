// FILE: mobile/components/quantity-stepper.tsx
import { Pressable, Text, View } from "react-native";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function QuantityStepper({ value, onChange, min = 0 }: QuantityStepperProps) {
  return (
    <View className="flex-row items-center rounded-full border border-border bg-card">
      <Pressable className="h-10 w-10 items-center justify-center" onPress={() => onChange(Math.max(min, value - 1))}>
        <Text className="text-lg text-primary">−</Text>
      </Pressable>
      <Text className="min-w-10 text-center text-sm font-interSemi text-primary">{value}</Text>
      <Pressable className="h-10 w-10 items-center justify-center" onPress={() => onChange(value + 1)}>
        <Text className="text-lg text-primary">+</Text>
      </Pressable>
    </View>
  );
}
