// FILE: mobile/app.config.js
module.exports = ({ config }) => ({
  ...config,
  name: "Amber POS",
  slug: "amber-pos-mobile",
  scheme: "amberpos",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  plugins: ["expo-router", "expo-secure-store"],
  experiments: {
    typedRoutes: true
  },
  extra: {
    ownerDashboardUrl: process.env.EXPO_PUBLIC_OWNER_DASHBOARD_URL,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
});
