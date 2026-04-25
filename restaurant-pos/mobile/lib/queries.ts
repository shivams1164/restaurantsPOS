// FILE: mobile/lib/queries.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { loginSchema } from "@/schemas/auth";
import { placeOrderSchema } from "@/schemas/order";
import type { Database, OrderStatus, Tables } from "@/types/database";

export type TypedSupabaseClient = SupabaseClient<Database>;

export async function signIn(client: TypedSupabaseClient, email: string, password: string) {
  const parsed = loginSchema.parse({ email, password });
  const { data, error } = await client.auth.signInWithPassword(parsed);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function fetchProfile(client: TypedSupabaseClient, userId: string): Promise<Tables<"profiles">> {
  const { data, error } = await client.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) {
    throw new Error(error?.message ?? "Profile not found");
  }
  return data;
}

export async function fetchTableStatus(
  client: TypedSupabaseClient,
  restaurantId: string,
  tableCount: number
): Promise<Array<{ table: number; status: "available" | "occupied" | "attention" }>> {
  const { data, error } = await client
    .from("orders")
    .select("table_number,status")
    .eq("restaurant_id", restaurantId)
    .eq("order_type", "dine_in")
    .in("status", ["pending", "preparing", "ready"])
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<number, "available" | "occupied" | "attention">();

  for (const order of data ?? []) {
    if (!order.table_number) continue;
    if (order.status === "ready") {
      map.set(order.table_number, "attention");
    } else {
      map.set(order.table_number, "occupied");
    }
  }

  return Array.from({ length: tableCount }).map((_, index) => {
    const table = index + 1;
    return {
      table,
      status: map.get(table) ?? "available"
    };
  });
}

export async function fetchWaiterMenu(
  client: TypedSupabaseClient,
  restaurantId: string,
  search: string,
  category: string
): Promise<Tables<"menu_items">[]> {
  let query = client
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("available", true)
    .order("name", { ascending: true });

  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function fetchMenuCategories(client: TypedSupabaseClient, restaurantId: string): Promise<string[]> {
  const { data, error } = await client.from("menu_items").select("category").eq("restaurant_id", restaurantId);

  if (error) {
    throw new Error(error.message);
  }

  return [...new Set((data ?? []).map((item) => item.category))];
}

export async function placeWaiterOrder(
  client: TypedSupabaseClient,
  waiterId: string,
  restaurantId: string,
  values: {
    tableNumber: number;
    notes?: string;
    items: Array<{ menuItemId: string; quantity: number; price: number; notes?: string }>;
  }
): Promise<string> {
  const parsed = placeOrderSchema.parse(values);

  const { data: order, error: orderError } = await client
    .from("orders")
    .insert({
      restaurant_id: restaurantId,
      table_number: parsed.tableNumber,
      order_type: "dine_in",
      created_by: waiterId,
      notes: parsed.notes ?? null,
      status: "pending"
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Could not create order");
  }

  const { error: itemsError } = await client.from("order_items").insert(
    parsed.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      price: item.price.toFixed(2),
      notes: item.notes ?? null
    }))
  );

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return order.id;
}

export async function fetchWaiterOrdersToday(
  client: TypedSupabaseClient,
  waiterId: string,
  restaurantId: string
): Promise<Tables<"orders">[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("created_by", waiterId)
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchOrderItems(client: TypedSupabaseClient, orderIds: string[]) {
  if (!orderIds.length) {
    return [] as Array<Tables<"order_items">>;
  }

  const { data, error } = await client.from("order_items").select("*").in("order_id", orderIds);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchDeliveryOrders(
  client: TypedSupabaseClient,
  deliveryId: string,
  restaurantId: string
): Promise<Tables<"orders">[]> {
  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("assigned_delivery_id", deliveryId)
    .neq("status", "delivered")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchDeliveryOrderDetails(client: TypedSupabaseClient, orderId: string) {
  const { data: order, error: orderError } = await client.from("orders").select("*").eq("id", orderId).single();
  const { data: items, error: itemError } = await client
    .from("order_items")
    .select("id,order_id,menu_item_id,quantity,price,notes")
    .eq("order_id", orderId);

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Order not found");
  }

  if (itemError) {
    throw new Error(itemError.message);
  }

  const menuItemIds = [...new Set((items ?? []).map((item) => item.menu_item_id))];
  const { data: menuItems, error: menuError } = menuItemIds.length
    ? await client.from("menu_items").select("id,name").in("id", menuItemIds)
    : { data: [], error: null };

  if (menuError) {
    throw new Error(menuError.message);
  }

  const namesById = new Map((menuItems ?? []).map((item) => [item.id, item.name]));

  return {
    order,
    items: (items ?? []).map((item) => ({
      id: item.id,
      name: namesById.get(item.menu_item_id) ?? "Unknown",
      quantity: item.quantity,
      price: Number(item.price),
      notes: item.notes
    }))
  };
}

export async function updateDeliveryOrderStatus(
  client: TypedSupabaseClient,
  orderId: string,
  status: Extract<OrderStatus, "picked" | "delivered">
): Promise<void> {
  const { error } = await client.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    throw new Error(error.message);
  }
}
