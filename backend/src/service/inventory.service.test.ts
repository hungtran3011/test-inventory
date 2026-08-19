import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from './inventory.service.js';
import type { Request, Response, NextFunction } from 'express';

// Mock the repository
vi.mock('../repositories/inventory.repository.js');

import { InventoryRepository } from '../repositories/inventory.repository.js';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  
  let mockRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InventoryService();
    mockRepository = vi.mocked(InventoryRepository.prototype);
    
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    
    mockNext = vi.fn();
  });

  describe('create', () => {
    it('should create a receipt and return 201', async () => {
      const createData = { companyName: 'Test Company', serial: '001' };
      mockReq.body = createData;
      
      const expectedReceipt = { id: 'uuid-123', ...createData };
      mockRepository.create.mockResolvedValue(expectedReceipt);

      await service.create(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: expectedReceipt });
    });

    it('should call next with error if creation fails', async () => {
      const error = new Error('Database Error');
      mockRepository.create.mockRejectedValue(error);

      await service.create(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should return receipt if found', async () => {
      mockReq.params = { id: 'uuid-123' };
      const expectedReceipt = { id: 'uuid-123', companyName: 'Test Company' };
      mockRepository.getById.mockResolvedValue(expectedReceipt);

      await service.getById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRepository.getById).toHaveBeenCalledWith('uuid-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: expectedReceipt });
    });

    it('should return 404 if receipt not found', async () => {
      mockReq.params = { id: 'not-found' };
      mockRepository.getById.mockResolvedValue(null);

      await service.getById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Receipt not found' });
    });
  });

  describe('search', () => {
    it('should parse query params and call repository search', async () => {
      mockReq.query = { searchStr: 'test', typeId: 'type-1', skip: '10', take: '20' };
      
      const expectedResults = [{ id: '1' }];
      mockRepository.search.mockResolvedValue(expectedResults);

      await service.search(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRepository.search).toHaveBeenCalledWith({
        searchStr: 'test',
        typeId: 'type-1',
        skip: 10,
        take: 20
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: expectedResults });
    });
    
    it('should use default pagination if not provided', async () => {
      mockReq.query = {};
      const expectedResults: any[] = [];
      mockRepository.search.mockResolvedValue(expectedResults);

      await service.search(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRepository.search).toHaveBeenCalledWith({
        searchStr: undefined,
        typeId: undefined,
        skip: 0,
        take: 10
      });
    });
  });
});
