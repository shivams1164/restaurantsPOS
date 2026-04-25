// FILE: web/types/database.ts
export type StaffRole = "owner" | "waiter" | "delivery";
export type OrderStatus = "pending" | "preparing" | "ready" | "picked" | "delivered" | "cancelled";
export type OrderType = "dine_in" | "delivery" | "takeaway";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          address: string | null;
          phone: string | null;
          logo_url: string | null;
          operating_hours: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          address?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          operating_hours?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          address?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          operating_hours?: Json;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: StaffRole;
          restaurant_id: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role: StaffRole;
          restaurant_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: StaffRole;
          restaurant_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          price: string;
          category: string;
          image_url: string | null;
          available: boolean;
          prep_time_min: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          price: string;
          category: string;
          image_url?: string | null;
          available?: boolean;
          prep_time_min?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string | null;
          price?: string;
          category?: string;
          image_url?: string | null;
          available?: boolean;
          prep_time_min?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          table_number: number | null;
          status: OrderStatus;
          order_type: OrderType;
          created_by: string;
          assigned_delivery_id: string | null;
          customer_name: string | null;
          customer_address: string | null;
          customer_phone: string | null;
          total_amount: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          table_number?: number | null;
          status?: OrderStatus;
          order_type: OrderType;
          created_by: string;
          assigned_delivery_id?: string | null;
          customer_name?: string | null;
          customer_address?: string | null;
          customer_phone?: string | null;
          total_amount?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          table_number?: number | null;
          status?: OrderStatus;
          order_type?: OrderType;
          created_by?: string;
          assigned_delivery_id?: string | null;
          customer_name?: string | null;
          customer_address?: string | null;
          customer_phone?: string | null;
          total_amount?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          price: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          price: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string;
          quantity?: number;
          price?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      my_role: {
        Args: Record<string, never>;
        Returns: StaffRole;
      };
      my_restaurant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      staff_role: StaffRole;
      order_status: OrderStatus;
      order_type: OrderType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
