import { Router } from "express";
import { InventoryService } from "../service/inventory.service.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { CreateReceiptSchema, UpdateReceiptSchema } from "../validations/inventory.validation.js";

const router = Router()
const service = new InventoryService()

router.post("/", validateRequest(CreateReceiptSchema), service.create)
router.get("/:id", service.getById)
router.get("/", service.search)
router.put("/:id", validateRequest(UpdateReceiptSchema), service.update)
router.delete("/:id", service.delete)

export { router as InventoryRouter };