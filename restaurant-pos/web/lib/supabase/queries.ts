// FILE: web/lib/supabase/queries.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { menuItemSchema } from "@/schemas/menu";
import { orderFilterSchema, orderStatusSchema } from "@/schemas/orders";
import { restaurantSettingsSchema } from "@/schemas/settings";
import { createStaffSchema } from "@/schemas/staff";
import type { Database, OrderStatus, Tables } from "@/types/database";
import { dayKey } from "@/lib/utils";

export type TypedSupabaseClient = SupabaseClient<Database>;

export interface DashboardSnapshot {
  stats: {
    todaysRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    activeStaff: number;
  };
  recentOrders: Array<{
    id: string;
    createdAt: string;
    tableLabel: string;
    customerName: string | null;
    status: OrderStatus;
    total: number;
  }>;
  revenueByDay: Array<{ day: string; revenue: number }>;
  statusBreakdown: Array<{ status: OrderStatus; count: number }>;
  topItems: Array<{ rank: number; name: string; qty: number; revenue: number }>;
}

export interface OrdersFilterInput {
  restaurantId: string;
  status: "all" | OrderStatus;
  search: string;
  date?: string;
}

export interface OrderListRow {
  id: string;
  createdAt: string;
  tableNumber: number | null;
  orderType: Tables<"orders">["order_type"];
  status: OrderStatus;
  totalAmount: number;
  customerName: string | null;
  waiterName: string;
  deliveryName: string | null;
  itemCount: number;
  itemSummary: string;
}

interface OrderDetails {
  order: Tables<"orders">;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes: string | null;
  }>;
}

function requireData<T>(data: T | null, error: Error | { message: string } | null, fallbackMessage: string): T {
  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    throw new Error(fallbackMessage);
  }

  return data;
}

function toTodayRange(date?: string): { from: string; to: string } {
  const base = date ? new Date(date) : new Date();
  const from = new Date(base);
  from.setHours(0, 0, 0, 0);

  const to = new Date(base);
  to.setHours(23, 59, 59, 999);

  return { from: from.toISOString(), to: to.toISOString() };
}

export async function signInWithEmailPassword(client: TypedSupabaseClient, email: string, password: string) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function signOut(client: TypedSupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getMyProfile(client: TypedSupabaseClient, userId: string): Promise<Tables<"profiles">> {
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).single();
  return requireData(data, error, "Profile not found");
}

export async function getOwnerRestaurant(
  client: TypedSupabaseClient,
  ownerId: string
): Promise<Tables<"restaurants"> | null> {
  const { data, error } = await client
    .from("restaurants")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createRestaurant(
  client: TypedSupabaseClient,
  payload: Pick<Tables<"restaurants">, "name" | "address" | "phone" | "logo_url" | "owner_id"> & {
    operating_hours: Record<string, { enabled: boolean; open: string; close: string }>;
  }
): Promise<Tables<"restaurants">> {
  const { data, error } = await client
    .from("restaurants")
    .insert({
      name: payload.name,
      address: payload.address,
      phone: payload.phone,
      logo_url: payload.logo_url,
      owner_id: payload.owner_id,
      operating_hours: payload.operating_hours
    })
    .select("*")
    .single();

  return requireData(data, error, "Failed to create restaurant");
}

export async function getDashboardSnapshot(
  client: TypedSupabaseClient,
  restaurantId: string
): Promise<DashboardSnapshot> {
  const now = new Date();
  const today = toTodayRange();

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const [ordersResult, activeStaffResult, recentOrdersResult] = await Promise.all([
    client
      .from("orders")
      .select("id,status,total_amount,created_at")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", weekStart.toISOString())
      .order("created_at", { ascending: true }),
    client
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .in("role", ["waiter", "delivery"]),
    client
      .from("orders")
      .select("id,created_at,table_number,order_type,status,total_amount,customer_name")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  if (ordersResult.error) {
    throw new Error(ordersResult.error.message);
  }

  if (recentOrdersResult.error) {
    throw new Error(recentOrdersResult.error.message);
  }

  if (activeStaffResult.error) {
    throw new Error(activeStaffResult.error.message);
  }

  const orders = ordersResult.data ?? [];
  const todaysOrders = orders.filter((order) => order.created_at >= today.from && order.created_at <= today.to);

  const todaysRevenue = todaysOrders.reduce((acc, order) => acc + Number(order.total_amount ?? 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const activeStaff = activeStaffResult.count ?? 0;

  const revenueBuckets = new Map<string, number>();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const cursor = new Date(now);
    cursor.setDate(cursor.getDate() - offset);
    const key = dayKey(cursor.toISOString());
    revenueBuckets.set(key, 0);
  }

  for (const order of orders) {
    const key = dayKey(order.created_at);
    if (revenueBuckets.has(key)) {
      revenueBuckets.set(key, (revenueBuckets.get(key) ?? 0) + Number(order.total_amount ?? 0));
    }
  }

  const revenueByDay = Array.from(revenueBuckets.entries()).map(([day, revenue]) => ({ day, revenue }));

  const statusCount = new Map<OrderStatus, number>();
  for (const order of orders) {
    statusCount.set(order.status, (statusCount.get(order.status) ?? 0) + 1);
  }

  const statusBreakdown: Array<{ status: OrderStatus; count: number }> = [
    "pending",
    "preparing",
    "ready",
    "delivered",
    "cancelled",
    "picked"
  ].map((status) => ({ status, count: statusCount.get(status) ?? 0 }));

  const todayOrderIds = todaysOrders.map((order) => order.id);

  let topItems: DashboardSnapshot["topItems"] = [];
  if (todayOrderIds.length > 0) {
    const orderItemsResult = await client
      .from("order_items")
      .select("menu_item_id,quantity,price")
      .in("order_id", todayOrderIds);

    if (orderItemsResult.error) {
      throw new Error(orderItemsResult.error.message);
    }

    const orderItems = orderItemsResult.data ?? [];
    const itemIds = [...new Set(orderItems.map((item) => item.menu_item_id))];

    const namesResult = itemIds.length
      ? await client.from("menu_items").select("id,name").in("id", itemIds)
      : { data: [], error: null };

    if (namesResult.error) {
      throw new Error(namesResult.error.message);
    }

    const namesById = new Map((namesResult.data ?? []).map((item) => [item.id, item.name]));
    const aggregate = new Map<string, { qty: number; revenue: number }>();

    for (const item of orderItems) {
      const current = aggregate.get(item.menu_item_id) ?? { qty: 0, revenue: 0 };
      current.qty += item.quantity;
      current.revenue += item.quantity * Number(item.price);
      aggregate.set(item.menu_item_id, current);
    }

    topItems = Array.from(aggregate.entries())
      .map(([menuItemId, metrics]) => ({
        name: namesById.get(menuItemId) ?? "Unknown item",
        qty: metrics.qty,
        revenue: metrics.revenue
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((item, index) => ({ rank: index + 1, ...item }));
  }

  const recentOrders = (recentOrdersResult.data ?? []).map((order) => ({
    id: order.id,
    createdAt: order.created_at,
    tableLabel:
      order.order_type === "dine_in"
        ? `Table ${order.table_number ?? "-"}`
        : order.order_type === "delivery"
          ? "Delivery"
          : "Takeaway",
    customerName: order.customer_name,
    status: order.status,
    total: Number(order.total_amount ?? 0)
  }));

  return {
    stats: {
      todaysRevenue,
      totalOrders,
      pendingOrders,
      activeStaff
    },
    recentOrders,
    revenueByDay,
    statusBreakdown,
    topItems
  };
}

export async function listOrders(client: TypedSupabaseClient, input: OrdersFilterInput): Promise<OrderListRow[]> {
  const parsed = orderFilterSchema.parse({
    status: input.status,
    search: input.search,
    date: input.date
  });

  const normalizedSearch = parsed.search.trim();

  let query = client
    .from("orders")
    .select("id,created_at,table_number,order_type,status,total_amount,customer_name,created_by,assigned_delivery_id")
    .eq("restaurant_id", input.restaurantId)
    .order("created_at", { ascending: false });

  if (parsed.status !== "all") {
    query = query.eq("status", parsed.status);
  }

  if (parsed.date) {
    const range = toTodayRange(parsed.date);
    query = query.gte("created_at", range.from).lte("created_at", range.to);
  }

  if (normalizedSearch) {
    const tableNumber = Number.parseInt(normalizedSearch, 10);
    if (!Number.isNaN(tableNumber)) {
      query = query.or(`customer_name.ilike.%${normalizedSearch}%,table_number.eq.${tableNumber}`);
    } else {
      query = query.ilike("customer_name", `%${normalizedSearch}%`);
    }
  }

  const { data: orders, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const rows = orders ?? [];
  if (rows.length === 0) {
    return [];
  }

  const orderIds = rows.map((order) => order.id);
  const userIds = [...new Set(rows.flatMap((order) => [order.created_by, order.assigned_delivery_id].filter(Boolean) as string[]))];

  const [itemsResult, profilesResult] = await Promise.all([
    client.from("order_items").select("order_id,quantity,menu_item_id").in("order_id", orderIds),
    userIds.length ? client.from("profiles").select("id,name").in("id", userIds) : Promise.resolve({ data: [], error: null })
  ]);

  if (itemsResult.error) {
    throw new Error(itemsResult.error.message);
  }

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  const items = itemsResult.data ?? [];
  const profiles = profilesResult.data ?? [];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile.name]));

  const itemsByOrder = new Map<string, { count: number }>();
  for (const item of items) {
    const current = itemsByOrder.get(item.order_id) ?? { count: 0 };
    current.count += item.quantity;
    itemsByOrder.set(item.order_id, current);
  }

  return rows.map((order) => {
    const itemCount = itemsByOrder.get(order.id)?.count ?? 0;
    return {
      id: order.id,
      createdAt: order.created_at,
      tableNumber: order.table_number,
      orderType: order.order_type,
      status: order.status,
      totalAmount: Number(order.total_amount),
      customerName: order.customer_name,
      waiterName: profileById.get(order.created_by) ?? "Unknown",
      deliveryName: order.assigned_delivery_id ? profileById.get(order.assigned_delivery_id) ?? null : null,
      itemCount,
      itemSummary: `${itemCount} item${itemCount === 1 ? "" : "s"}`
    };
  });
}

export async function getOrderDetails(client: TypedSupabaseClient, orderId: string): Promise<OrderDetails> {
  const { data: order, error: orderError } = await client.from("orders").select("*").eq("id", orderId).single();
  const { data: items, error: itemsError } = await client
    .from("order_items")
    .select("id,quantity,price,notes,menu_item_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (orderError) {
    throw new Error(orderError.message);
  }

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const menuItemIds = [...new Set((items ?? []).map((item) => item.menu_item_id))];
  const { data: menuNames, error: menuError } = menuItemIds.length
    ? await client.from("menu_items").select("id,name").in("id", menuItemIds)
    : { data: [], error: null };

  if (menuError) {
    throw new Error(menuError.message);
  }

  const menuNameById = new Map((menuNames ?? []).map((item) => [item.id, item.name]));

  return {
    order,
    items: (items ?? []).map((item) => ({
      id: item.id,
      name: menuNameById.get(item.menu_item_id) ?? "Unknown item",
      quantity: item.quantity,
      price: Number(item.price),
      notes: item.notes
    }))
  };
}

export async function updateOrderStatus(
  client: TypedSupabaseClient,
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const parsedStatus = orderStatusSchema.parse(status);
  const { error } = await client.from("orders").update({ status: parsedStatus }).eq("id", orderId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function bulkUpdateOrderStatus(
  client: TypedSupabaseClient,
  orderIds: string[],
  status: OrderStatus
): Promise<void> {
  const parsedStatus = orderStatusSchema.parse(status);
  const { error } = await client.from("orders").update({ status: parsedStatus }).in("id", orderIds);
  if (error) {
    throw new Error(error.message);
  }
}

export async function assignDeliveryBoy(
  client: TypedSupabaseClient,
  orderId: string,
  deliveryId: string | null
): Promise<void> {
  const { error } = await client.from("orders").update({ assigned_delivery_id: deliveryId }).eq("id", orderId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listDeliveryStaff(client: TypedSupabaseClient, restaurantId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("id,name,is_active")
    .eq("restaurant_id", restaurantId)
    .eq("role", "delivery")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listMenuItems(client: TypedSupabaseClient, restaurantId: string, category?: string) {
  let query = client.from("menu_items").select("*").eq("restaurant_id", restaurantId).order("name", { ascending: true });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listMenuCategories(client: TypedSupabaseClient, restaurantId: string) {
  const { data, error } = await client
    .from("menu_items")
    .select("category")
    .eq("restaurant_id", restaurantId)
    .order("category", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return [...new Set((data ?? []).map((item) => item.category))];
}

export async function upsertMenuItem(
  client: TypedSupabaseClient,
  restaurantId: string,
  values: {
    id?: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    prep_time_min: number;
    available: boolean;
    image_url?: string;
  }
) {
  const parsed = menuItemSchema.parse(values);

  const payload = {
    id: parsed.id,
    restaurant_id: restaurantId,
    name: parsed.name,
    description: parsed.description || null,
    price: parsed.price.toFixed(2),
    category: parsed.category,
    prep_time_min: parsed.prep_time_min,
    available: parsed.available,
    image_url: parsed.image_url || null
  };

  const query = parsed.id
    ? client.from("menu_items").update(payload).eq("id", parsed.id).select("*").single()
    : client.from("menu_items").insert(payload).select("*").single();

  const { data, error } = await query;
  return requireData(data, error, "Could not save menu item");
}

export async function removeMenuItem(client: TypedSupabaseClient, itemId: string) {
  const { error } = await client.from("menu_items").delete().eq("id", itemId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function setMenuAvailability(
  client: TypedSupabaseClient,
  itemId: string,
  available: boolean
): Promise<void> {
  const { error } = await client.from("menu_items").update({ available }).eq("id", itemId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadPublicImage(
  client: TypedSupabaseClient,
  path: string,
  file: File,
  bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "restaurant-assets"
) {
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function listStaff(client: TypedSupabaseClient, restaurantId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("id,name,email,role,phone,avatar_url,is_active,created_at,updated_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createStaffUser(
  client: TypedSupabaseClient,
  values: {
    name: string;
    email: string;
    password: string;
    role: "waiter" | "delivery";
    phone?: string;
    restaurantId: string;
  }
) {
  const parsed = createStaffSchema.parse(values);

  const { data, error } = await client.functions.invoke("create-staff-user", {
    body: {
      name: parsed.name,
      email: parsed.email,
      password: parsed.password,
      role: parsed.role,
      phone: parsed.phone || undefined,
      restaurantId: values.restaurantId
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function setStaffActive(
  client: TypedSupabaseClient,
  userId: string,
  isActive: boolean
): Promise<void> {
  const { error } = await client.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPasswordReset(client: TypedSupabaseClient, email: string) {
  const { error } = await client.auth.resetPasswordForEmail(email);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getRestaurantSettings(client: TypedSupabaseClient, restaurantId: string) {
  const { data, error } = await client
    .from("restaurants")
    .select("id,name,address,phone,logo_url,operating_hours")
    .eq("id", restaurantId)
    .single();

  return requireData(data, error, "Restaurant settings not found");
}

export async function updateRestaurantSettings(
  client: TypedSupabaseClient,
  restaurantId: string,
  values: {
    name: string;
    address?: string;
    phone?: string;
    logo_url?: string;
    operating_hours: Record<string, { enabled: boolean; open: string; close: string }>;
  }
) {
  const parsed = restaurantSettingsSchema.parse(values);

  const { data, error } = await client
    .from("restaurants")
    .update({
      name: parsed.name,
      address: parsed.address || null,
      phone: parsed.phone || null,
      logo_url: parsed.logo_url || null,
      operating_hours: parsed.operating_hours
    })
    .eq("id", restaurantId)
    .select("id,name,address,phone,logo_url,operating_hours")
    .single();

  return requireData(data, error, "Could not update restaurant settings");
}

export async function ensureOwnerRestaurant(
  client: TypedSupabaseClient,
  ownerProfile: Tables<"profiles">
): Promise<Tables<"restaurants">> {
  const existing = await getOwnerRestaurant(client, ownerProfile.id);
  if (existing) {
    return existing;
  }

  const defaultHours = {
    monday: { enabled: true, open: "09:00", close: "21:00" },
    tuesday: { enabled: true, open: "09:00", close: "21:00" },
    wednesday: { enabled: true, open: "09:00", close: "21:00" },
    thursday: { enabled: true, open: "09:00", close: "21:00" },
    friday: { enabled: true, open: "09:00", close: "22:00" },
    saturday: { enabled: true, open: "10:00", close: "22:00" },
    sunday: { enabled: true, open: "10:00", close: "20:00" }
  };

  const restaurant = await createRestaurant(client, {
    name: `${ownerProfile.name}'s Restaurant`,
    address: null,
    phone: ownerProfile.phone,
    logo_url: ownerProfile.avatar_url,
    owner_id: ownerProfile.id,
    operating_hours: defaultHours
  });

  const { error } = await client.from("profiles").update({ restaurant_id: restaurant.id }).eq("id", ownerProfile.id);
  if (error) {
    throw new Error(error.message);
  }

  return restaurant;
}
