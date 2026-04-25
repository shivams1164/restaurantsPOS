// FILE: mobile/constants/strings.ts
export const mobileStrings = {
  appName: "Amber POS",
  login: {
    title: "Sign in",
    subtitle: "Use your restaurant account",
    email: "Email",
    password: "Password",
    submit: "Continue"
  },
  waiter: {
    tablesTitle: "Tables",
    menuTitle: "Menu",
    ordersTitle: "My Orders",
    placeOrder: "Place Order",
    viewCart: "View Cart"
  },
  delivery: {
    ordersTitle: "Your deliveries",
    picked: "Mark Picked Up",
    delivered: "Mark Delivered"
  }
} as const;

export const tableStatusColors = {
  available: "#2E7D32",
  occupied: "#DC2626",
  attention: "#E8A020"
} as const;
