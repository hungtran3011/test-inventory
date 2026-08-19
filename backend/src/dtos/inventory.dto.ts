export interface ReceiptTypeDto {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface ReceiptItemDto {
  id?: string;
  item: string;
  code: string;
  unit: string;
  quantityByReceipt: number;
  quantityByReality: number;
  unitPrice: number;
  total: number;
}

export interface CreateReceiptItemDto {
  item: string;
  code: string;
  unit: string;
  quantityByReceipt: number;
  quantityByReality: number;
  unitPrice: number;
  total?: number;
}

export interface CreateReceiptDto {
  companyName: string;
  departmentName: string;
  createdDate?: Date | string;
  serial: string;
  debit: string;
  credit: string;
  deliverName: string;
  receiptTypeId: string;
  sourceReceiptDate: Date | string;
  receiptIssuer: string;
  warehouse: string;
  location: string;
  attachDocument?: string;
  totalInText: string;
  receiptItems: CreateReceiptItemDto[];
}

export interface UpdateReceiptDto extends Partial<Omit<CreateReceiptDto, 'receiptItems'>> {
  receiptItems?: CreateReceiptItemDto[];
}

export interface ReceiptResponseDto {
  id: string;
  companyName: string;
  departmentName: string;
  createdDate: Date;
  serial: string;
  debit: string;
  credit: string;
  deliverName: string;
  receiptTypeId: string;
  receiptType?: ReceiptTypeDto;
  sourceReceiptDate: Date;
  receiptIssuer: string;
  warehouse: string;
  location: string;
  attachDocument?: string | null;
  totalInText: string;
  receiptItems: (ReceiptItemDto & { id: string; receiptId: string })[];
  createdAt: Date;
  updatedAt: Date;
}