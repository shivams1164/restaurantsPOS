// FILE: web/schemas/orders.ts
import { z } from "zod";

export const orderStatusSchema = z.enum(["pending", "preparing", "ready", "picked", "delivered", "cancelled"]);

export const orderFilterSchema = z.object({
  status: z.union([orderStatusSchema, z.literal("all")]).default("all"),
  search: z.string().trim().default(""),
  date: z.string().optional()
});

export type OrderFilterValues = z.infer<typeof orderFilterSchema>;
