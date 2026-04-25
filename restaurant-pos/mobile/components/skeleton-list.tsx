// FILE: mobile/components/skeleton-list.tsx
import { View } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <SkeletonPlaceholder borderRadius={12}>
      <View className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <View key={index} style={{ height: 96 }} />
        ))}
      </View>
    </SkeletonPlaceholder>
  );
}
