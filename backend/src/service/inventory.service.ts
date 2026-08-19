import type { NextFunction, Request, Response } from "express";
import { InventoryRepository } from "../repositories/inventory.repository.js";
import type { CreateReceiptDto, UpdateReceiptDto } from "../dtos/inventory.dto.js";

const repository = new InventoryRepository();

export class InventoryService {
  /**
   * Tạo phiếu mới
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateReceiptDto = req.body;
      const newReceipt = await repository.create(data);
      res.status(201).json({ success: true, data: newReceipt });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy chi tiết phiếu theo ID
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const receipt = await repository.getById(id.toString());
      
      if (!receipt) {
        res.status(404).json({ success: false, message: "Receipt not found" });
        return;
      }
      
      res.status(200).json({ success: true, data: receipt });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tìm kiếm và phân trang
   */
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const searchStr = req.query.searchStr as string | undefined;
      const typeId = req.query.typeId as string | undefined;
      const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
      const take = req.query.take ? parseInt(req.query.take as string, 10) : 10;

      const results = await repository.search({ searchStr, typeId, skip, take });
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật phiếu
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: UpdateReceiptDto = req.body;
      
      const updatedReceipt = await repository.update(id.toString(), data);
      res.status(200).json({ success: true, data: updatedReceipt });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa phiếu
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await repository.delete(id.toString());
      res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
