// FILE: web/schemas/staff.ts
import { z } from "zod";
import { sanitizeText } from "@/lib/utils";

export const createStaffSchema = z.object({
  name: z.string().trim().min(2).max(120).transform(sanitizeText),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  role: z.enum(["waiter", "delivery"]),
  phone: z.string().trim().min(7).max(30).transform(sanitizeText).optional().or(z.literal(""))
});

export type CreateStaffValues = z.infer<typeof createStaffSchema>;
