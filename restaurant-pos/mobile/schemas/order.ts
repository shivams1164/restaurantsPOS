// FILE: mobile/schemas/order.ts
import { z } from "zod";

export const placeOrderSchema = z.object({
  tableNumber: z.number().int().min(1),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
        notes: z.string().trim().max(200).optional()
      })
    )
    .min(1)
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
