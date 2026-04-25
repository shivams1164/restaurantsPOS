// FILE: web/constants/strings.ts
export const webStrings = {
  appName: "Amber POS",
  nav: {
    dashboard: "Dashboard",
    orders: "Orders",
    menu: "Menu",
    staff: "Staff",
    settings: "Settings"
  },
  auth: {
    title: "Welcome back",
    subtitle: "Sign in with your restaurant account",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Sign in",
    ownerOnly: "Owner accounts use this web dashboard."
  },
  dashboard: {
    todayRevenue: "Today's Revenue",
    totalOrders: "Total Orders",
    pendingOrders: "Pending Orders",
    activeStaff: "Active Staff",
    recentOrders: "Live Orders Feed",
    revenueTitle: "Last 7 Days Revenue",
    statusTitle: "Order Status Split",
    topItemsTitle: "Top 5 Items Today"
  },
  orders: {
    searchPlaceholder: "Search by table or customer",
    all: "All",
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    delivered: "Delivered",
    bulkUpdate: "Bulk Update Status"
  },
  menu: {
    addItem: "Add Item",
    emptyTitle: "No menu items yet",
    emptyDescription: "Create your first dish to start taking orders."
  },
  staff: {
    addStaff: "Add Staff",
    resetPassword: "Reset Password",
    active: "Active",
    inactive: "Inactive"
  },
  settings: {
    profileTitle: "Restaurant Profile",
    hoursTitle: "Operating Hours",
    save: "Save Changes"
  },
  statuses: {
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    picked: "Picked",
    delivered: "Delivered",
    cancelled: "Cancelled"
  },
  toast: {
    saved: "Changes saved successfully",
    failed: "Something went wrong",
    created: "Created successfully",
    updated: "Updated successfully",
    deleted: "Deleted successfully"
  }
} as const;

export const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
] as const;
