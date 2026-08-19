import { z } from "zod";

export const CreateReceiptTypeSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50, "Code must be at most 50 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores"),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters"),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be at most 1000 characters")
      .optional(),
  }),
});

export const UpdateReceiptTypeSchema = z.object({
  body: z.object({
    code: z
      .string()
      .trim()
      .min(1, "Code is required")
      .max(50, "Code must be at most 50 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores")
      .optional(),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(255, "Name must be at most 255 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description must be at most 1000 characters")
      .optional()
      .nullable(),
  }),
});
