import { Router } from "express";
import { ReceiptTypeService } from "../service/receipt-type.service.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { CreateReceiptTypeSchema, UpdateReceiptTypeSchema } from "../validations/receipt-type.validation.js";

export const ReceiptTypeRouter = Router();
const service = new ReceiptTypeService();

ReceiptTypeRouter.post("/", validateRequest(CreateReceiptTypeSchema), service.create);
ReceiptTypeRouter.get("/all", service.getAll); 
ReceiptTypeRouter.get("/", service.search);
ReceiptTypeRouter.get("/:id", service.getById);
ReceiptTypeRouter.put("/:id", validateRequest(UpdateReceiptTypeSchema), service.update);
ReceiptTypeRouter.delete("/:id", service.delete);
