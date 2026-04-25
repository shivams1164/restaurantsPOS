// FILE: web/schemas/menu.ts
import { z } from "zod";
import { sanitizeText } from "@/lib/utils";

export const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120).transform(sanitizeText),
  description: z.string().trim().max(1000).transform(sanitizeText).optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  category: z.string().trim().min(2).max(80).transform(sanitizeText),
  prep_time_min: z.coerce.number().int().min(0).max(240),
  available: z.boolean(),
  image_url: z.string().url().optional().or(z.literal(""))
});

export type MenuItemValues = z.infer<typeof menuItemSchema>;
