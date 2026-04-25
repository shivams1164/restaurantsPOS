// FILE: web/schemas/settings.ts
import { z } from "zod";
import { daysOfWeek } from "@/constants/strings";
import { sanitizeText } from "@/lib/utils";

const daySchema = z.object({
  enabled: z.boolean(),
  open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
});

export const operatingHoursSchema = z.object(
  Object.fromEntries(daysOfWeek.map((day) => [day, daySchema])) as Record<(typeof daysOfWeek)[number], typeof daySchema>
);

export const restaurantSettingsSchema = z.object({
  name: z.string().trim().min(2).max(120).transform(sanitizeText),
  address: z.string().trim().max(300).transform(sanitizeText).optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(30).transform(sanitizeText).optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  operating_hours: operatingHoursSchema
});

export type RestaurantSettingsValues = z.infer<typeof restaurantSettingsSchema>;
