import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { InventoryRouter } from './inventory.route.js';
import { globalErrorHandler } from '../middlewares/error.middleware.js';

// Mock repository instead of service, because router instantiates service internally
vi.mock('../repositories/inventory.repository.js');

import { InventoryRepository } from '../repositories/inventory.repository.js';

const app = express();
app.use(express.json());
app.use('/api/v1/inventory', InventoryRouter);
// Đưa error middleware vào để xử lý lỗi (ví dụ lỗi Zod 400)
app.use(globalErrorHandler);

describe('Inventory Routes & Validation', () => {
  let mockRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = vi.mocked(InventoryRepository.prototype);
  });

  describe('POST /api/v1/inventory (Create Receipt)', () => {
    const validPayload = {
      companyName: 'Test Corp',
      departmentName: 'IT',
      serial: 'REC-001',
      debit: '156',
      credit: '331',
      deliverName: 'Nguyen Van A',
      receiptTypeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // valid UUID
      sourceReceiptDate: '2023-10-01T00:00:00.000Z',
      receiptIssuer: 'Admin',
      warehouse: 'Kho A',
      location: 'Kệ 1',
      totalInText: 'Một triệu',
      receiptItems: [
        {
          item: 'Laptop',
          code: 'LT-01',
          unit: 'Cái',
          quantityByReceipt: 10,
          quantityByReality: 10,
          unitPrice: 15000000,
        },
      ],
    };

    it('Happy case: should create successfully with valid payload', async () => {
      const mockResult = { id: 'uuid-123', ...validPayload };
      mockRepository.create.mockResolvedValue(mockResult);

      const res = await request(app).post('/api/v1/inventory').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('uuid-123');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('Unhappy case 1: Missing required fields (companyName)', async () => {
      const { companyName, ...invalidPayload } = validPayload;

      const res = await request(app).post('/api/v1/inventory').send(invalidPayload);

      expect(res.status).toBe(400); // Validation error
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'body.companyName' }),
        ])
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('Unhappy case 2: Wrong format (invalid UUID for receiptTypeId)', async () => {
      const invalidPayload = { ...validPayload, receiptTypeId: 'invalid-uuid-format' };

      const res = await request(app).post('/api/v1/inventory').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'body.receiptTypeId',
            message: 'Invalid receipt type ID', // Lỗi từ Zod schema
          }),
        ])
      );
    });

    it('Unhappy case 3: Empty receipt items array', async () => {
      const invalidPayload = { ...validPayload, receiptItems: [] };

      const res = await request(app).post('/api/v1/inventory').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'body.receiptItems',
            message: 'At least one receipt item is required',
          }),
        ])
      );
    });
    
    it('Unhappy case 4: Negative quantity in receipt items', async () => {
      const invalidPayload = { 
        ...validPayload, 
        receiptItems: [{ ...validPayload.receiptItems[0], quantityByReality: -5 }] 
      };

      const res = await request(app).post('/api/v1/inventory').send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'body.receiptItems.0.quantityByReality',
            message: 'Quantity by reality must be a positive number',
          }),
        ])
      );
    });
  });
});
