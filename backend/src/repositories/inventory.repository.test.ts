import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { InventoryRepository } from './inventory.repository.js';
import { prisma } from '../config/prisma.js';

// Mock the prisma client exported from config
vi.mock('../config/prisma.js', () => ({
  prisma: mockDeep(),
}));

describe('InventoryRepository', () => {
  let repository: InventoryRepository;
  const mockPrisma = vi.mocked(prisma);

  beforeEach(() => {
    mockReset(mockPrisma);
    repository = new InventoryRepository();
  });

  describe('getById', () => {
    it('should find a receipt by id including its items and type', async () => {
      const mockReceipt: any = {
        id: 'receipt-1',
        companyName: 'Test Corp',
        receiptItems: [],
        receiptType: { id: 'type-1', name: 'Nhập kho' }
      };

      mockPrisma.receipt.findUnique.mockResolvedValue(mockReceipt);

      const result = await repository.getById('receipt-1');

      expect(mockPrisma.receipt.findUnique).toHaveBeenCalledWith({
        where: { id: 'receipt-1' },
        include: {
          receiptItems: true,
          receiptType: true,
        },
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should return null if not found', async () => {
      mockPrisma.receipt.findUnique.mockResolvedValue(null);
      
      const result = await repository.getById('not-found');
      
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a receipt by id', async () => {
      const mockDeleted: any = { id: 'receipt-1', companyName: 'Deleted Corp' };
      mockPrisma.receipt.delete.mockResolvedValue(mockDeleted);

      const result = await repository.delete('receipt-1');

      expect(mockPrisma.receipt.delete).toHaveBeenCalledWith({
        where: { id: 'receipt-1' },
      });
      expect(result).toEqual(mockDeleted);
    });
  });
});
