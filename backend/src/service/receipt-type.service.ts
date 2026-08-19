import type { NextFunction, Request, Response } from "express";
import { ReceiptTypeRepository } from "../repositories/receipt-type.repository.js";
import type { CreateReceiptType, UpdateReceiptType } from "../dtos/receipt-type.dto.js";

const repository = new ReceiptTypeRepository();

export class ReceiptTypeService {
  /**
   * Tạo ReceiptType mới
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateReceiptType = req.body;
      const newType = await repository.create(data);
      res.status(201).json({ success: true, data: newType });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy chi tiết ReceiptType theo ID
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const type = await repository.getById(id.toString());
      
      if (!type) {
        res.status(404).json({ success: false, message: "Receipt Type not found" });
        return;
      }
      
      res.status(200).json({ success: true, data: type });
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
      const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
      const take = req.query.take ? parseInt(req.query.take as string, 10) : 10;

      const results = await repository.search({ searchStr, skip, take });
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy tất cả (dùng cho Dropdown)
   */
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await repository.getAll();
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật ReceiptType
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: UpdateReceiptType = req.body;
      
      // Bỏ id ra khỏi body nếu có để tránh lỗi update id
      const { id: _, ...updateData } = data;
      
      const updatedType = await repository.update(id.toString(), updateData);
      res.status(200).json({ success: true, data: updatedType });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa ReceiptType
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
