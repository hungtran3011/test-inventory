import { prisma } from "../config/prisma.js";
import type { CreateReceiptDto, UpdateReceiptDto } from "../dtos/inventory.dto.js";

export class InventoryRepository {
  /**
   * Tạo mới một Phiếu Nhập/Xuất kho (Receipt) kèm theo các mặt hàng (ReceiptItems)
   */
  async create(data: CreateReceiptDto) {
    return prisma.receipt.create({
      data: {
        companyName: data.companyName,
        departmentName: data.departmentName,
        createdDate: data.createdDate ? new Date(data.createdDate) : new Date(),
        serial: data.serial,
        debit: data.debit,
        credit: data.credit,
        deliverName: data.deliverName,
        receiptTypeId: data.receiptTypeId,
        sourceReceiptDate: new Date(data.sourceReceiptDate),
        receiptIssuer: data.receiptIssuer,
        warehouse: data.warehouse,
        location: data.location,
        attachDocument: data.attachDocument,
        totalInText: data.totalInText,
        // Tạo luôn các ReceiptItems (Nested write)
        receiptItems: {
          create: data.receiptItems.map((item) => ({
            item: item.item,
            code: item.code,
            unit: item.unit,
            quantityByReceipt: item.quantityByReceipt,
            quantityByReality: item.quantityByReality,
            unitPrice: item.unitPrice,
            // Nếu không truyền total, tự động tính = thực tế * đơn giá
            total: item.total ?? (item.quantityByReality * item.unitPrice),
          })),
        },
      },
      // Trả về cả các items sau khi tạo
      include: {
        receiptItems: true,
        receiptType: true,
      },
    });
  }

  /**
   * Lấy Phiếu theo ID
   */
  async getById(id: string) {
    return prisma.receipt.findUnique({
      where: { id },
      include: {
        receiptItems: true,
        receiptType: true,
      },
    });
  }

  /**
   * Tìm kiếm / Phân trang Phiếu Nhập/Xuất kho
   */
  async search(params: { searchStr?: string; typeId?: string; skip?: number; take?: number }) {
    const { searchStr, typeId, skip = 0, take = 10 } = params;

    return prisma.receipt.findMany({
      where: {
        AND: [
          searchStr ? { serial: { contains: searchStr, mode: 'insensitive' } } : {},
          typeId ? { receiptTypeId: typeId } : {},
        ],
      },
      include: {
        receiptType: true,
      },
      skip,
      take,
      orderBy: { createdDate: 'desc' },
    });
  }

  /**
   * Cập nhật Phiếu Nhập/Xuất kho.
   * Lưu ý: Nếu muốn cập nhật ReceiptItems phức tạp, cần dùng Prisma transaction để xóa/thêm items mới.
   */
  async update(id: string, data: UpdateReceiptDto) {
    const { receiptItems, ...receiptData } = data;

    // Lọc ra các trường có trong Prisma schema để tránh lỗi Unknown argument
    const updateData: any = {};
    const allowedKeys = ['companyName', 'departmentName', 'createdDate', 'serial', 'debit', 'credit', 'deliverName', 'receiptTypeId', 'sourceReceiptDate', 'receiptIssuer', 'warehouse', 'location', 'attachDocument', 'totalInText'];
    
    for (const key of allowedKeys) {
      if (key in receiptData) {
        if (key === 'createdDate' || key === 'sourceReceiptDate') {
          updateData[key] = receiptData[key as keyof typeof receiptData] ? new Date(receiptData[key as keyof typeof receiptData] as string) : undefined;
        } else {
          updateData[key] = receiptData[key as keyof typeof receiptData];
        }
      }
    }

    // Sử dụng transaction nếu có cập nhật nested items
    return prisma.$transaction(async (tx) => {
      // 1. Cập nhật bảng Receipt chính
      const updatedReceipt = await tx.receipt.update({
        where: { id },
        data: updateData,
      });

      // 2. Xử lý receiptItems nếu client gửi lên danh sách mới
      if (receiptItems && receiptItems.length > 0) {
        // Xóa các items cũ
        await tx.receiptItem.deleteMany({
          where: { receiptId: id },
        });

        // Tạo lại items mới
        await tx.receiptItem.createMany({
          data: receiptItems.map((item) => ({
            receiptId: id,
            item: item.item,
            code: item.code,
            unit: item.unit,
            quantityByReceipt: item.quantityByReceipt,
            quantityByReality: item.quantityByReality,
            unitPrice: item.unitPrice,
            total: item.total ?? (item.quantityByReality * item.unitPrice),
          })),
        });
      }

      // 3. Trả về data mới nhất
      return tx.receipt.findUnique({
        where: { id },
        include: { receiptItems: true, receiptType: true },
      });
    });
  }

  /**
   * Xóa Phiếu Nhập/Xuất kho (Cascade sẽ tự động xóa các ReceiptItems liên quan)
   */
  async delete(id: string) {
    return prisma.receipt.delete({
      where: { id },
    });
  }
}
