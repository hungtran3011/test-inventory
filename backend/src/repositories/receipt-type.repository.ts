import { prisma } from "../config/prisma.js";
import type { CreateReceiptType, UpdateReceiptType } from "../dtos/receipt-type.dto.js";

export class ReceiptTypeRepository {
  /**
   * Tạo mới ReceiptType
   */
  async create(data: CreateReceiptType) {
    return prisma.receiptType.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });
  }

  /**
   * Lấy chi tiết ReceiptType theo ID
   */
  async getById(id: string) {
    return prisma.receiptType.findUnique({
      where: { id },
    });
  }

  /**
   * Tìm kiếm và phân trang
   */
  async search(params: { searchStr?: string; skip?: number; take?: number }) {
    const { searchStr, skip = 0, take = 10 } = params;

    return prisma.receiptType.findMany({
      where: searchStr
        ? {
            OR: [
              { code: { contains: searchStr, mode: "insensitive" } },
              { name: { contains: searchStr, mode: "insensitive" } },
            ],
          }
        : {},
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Lấy tất cả (không phân trang) thường dùng cho dropdown list
   */
  async getAll() {
    return prisma.receiptType.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Cập nhật ReceiptType
   */
  async update(id: string, data: Omit<UpdateReceiptType, "id">) {
    return prisma.receiptType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  /**
   * Xóa ReceiptType
   */
  async delete(id: string) {
    return prisma.receiptType.delete({
      where: { id },
    });
  }
}