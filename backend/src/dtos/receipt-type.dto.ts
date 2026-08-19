export interface ReceiptType {
  id: string,
  code: string,
  name: string,
  description: string,
}

export interface CreateReceiptType {
  code: string,
  name: string,
  description: string
}

export interface UpdateReceiptType {
  id: string
  name: string,
  description: string
}