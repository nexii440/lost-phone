import { z } from "zod";

export const DEVICE_TYPES = ["Phone", "Tablet", "Smartwatch", "Other"] as const;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export const reportSchema = z.object({
  device_type: z.enum(DEVICE_TYPES, {
    errorMap: () => ({ message: "Choose a device type." }),
  }),
  brand: z
    .string()
    .trim()
    .min(1, "Brand is required.")
    .max(80, "Keep it under 80 characters."),
  model: z
    .string()
    .trim()
    .max(80, "Keep it under 80 characters.")
    .optional()
    .transform((v) => (v ? v : null)),
  color: z
    .string()
    .trim()
    .max(40, "Keep it under 40 characters.")
    .optional()
    .transform((v) => (v ? v : null)),
  last_seen_location: z
    .string()
    .trim()
    .min(1, "Let people know roughly where it was last seen.")
    .max(200, "Keep it under 200 characters."),
  last_seen_date: z
    .string()
    .trim()
    .min(1, "Date is required.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date.")
    .refine((v) => v <= todayIsoDate(), "Date can't be in the future."),
  description: z
    .string()
    .trim()
    .min(10, "Add a little more detail (at least 10 characters).")
    .max(2000, "Keep it under 2000 characters."),
  contact_email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  contact_phone: z
    .string()
    .trim()
    .max(30, "Keep it under 30 characters.")
    .optional()
    .transform((v) => (v ? v : null)),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;
