import { z } from "zod";

const ReceiptItemSchema = z.object({
  item: z.string().trim().min(1, "Item name is required").max(255, "Item name must be at most 255 characters"),
  code: z.string().trim().min(1, "Item code is required").max(50, "Item code must be at most 50 characters"),
  unit: z.string().trim().min(1, "Unit is required").max(50, "Unit must be at most 50 characters"),
  quantityByReceipt: z.number().nonnegative("Quantity by receipt must be a positive number"),
  quantityByReality: z.number().nonnegative("Quantity by reality must be a positive number"),
  unitPrice: z.number().nonnegative("Unit price must be a positive number"),
  total: z.number().nonnegative("Total must be a positive number").optional(),
});

export const CreateReceiptSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1, "Company name is required").max(255),
    departmentName: z.string().trim().min(1, "Department name is required").max(255),
    createdDate: z.union([z.string().datetime(), z.date()]).optional(),
    serial: z.string().trim().min(1, "Serial is required").max(100),
    debit: z.string().trim().min(1, "Debit account is required").max(50),
    credit: z.string().trim().min(1, "Credit account is required").max(50),
    deliverName: z.string().trim().min(1, "Deliver name is required").max(255),
    receiptTypeId: z.string().uuid("Invalid receipt type ID"),
    sourceReceiptDate: z.union([z.string().datetime(), z.date()]),
    receiptIssuer: z.string().trim().min(1, "Receipt issuer is required").max(255),
    warehouse: z.string().trim().min(1, "Warehouse is required").max(255),
    location: z.string().trim().min(1, "Location is required").max(255),
    attachDocument: z.string().trim().max(1000).optional(),
    totalInText: z.string().trim().min(1, "Total in text is required").max(1000),
    receiptItems: z.array(ReceiptItemSchema).min(1, "At least one receipt item is required"),
  }),
});

export const UpdateReceiptSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1, "Company name is required").max(255).optional(),
    departmentName: z.string().trim().min(1, "Department name is required").max(255).optional(),
    createdDate: z.union([z.string().datetime(), z.date()]).optional(),
    serial: z.string().trim().min(1, "Serial is required").max(100).optional(),
    debit: z.string().trim().min(1, "Debit account is required").max(50).optional(),
    credit: z.string().trim().min(1, "Credit account is required").max(50).optional(),
    deliverName: z.string().trim().min(1, "Deliver name is required").max(255).optional(),
    receiptTypeId: z.string().uuid("Invalid receipt type ID").optional(),
    sourceReceiptDate: z.union([z.string().datetime(), z.date()]).optional(),
    receiptIssuer: z.string().trim().min(1, "Receipt issuer is required").max(255).optional(),
    warehouse: z.string().trim().min(1, "Warehouse is required").max(255).optional(),
    location: z.string().trim().min(1, "Location is required").max(255).optional(),
    attachDocument: z.string().trim().max(1000).optional().nullable(),
    totalInText: z.string().trim().min(1, "Total in text is required").max(1000).optional(),
    receiptItems: z.array(ReceiptItemSchema).min(1, "At least one receipt item is required").optional(),
  }),
});
