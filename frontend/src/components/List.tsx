import { useEffect, useState } from "react";
import { Table, Button, Space, Card, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ReceiptResponseDto, ReceiptTypeDto } from "../models/receipt.model";
import dayjs from "dayjs";
import { ReceiptModal } from "./ReceiptModal";

export function ReceiptList() {
  const [data, setData] = useState<ReceiptResponseDto[]>([]);
  const [receiptTypes, setReceiptTypes] = useState<ReceiptTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceiptResponseDto | undefined>(undefined);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/inventory');
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch {
      message.error("Lỗi khi tải dữ liệu phiếu nhập");
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadAll = async () => {
      try {
        const [receiptRes, typeRes] = await Promise.all([
          fetch('/api/v1/inventory'),
          fetch('/api/v1/receipt-types/all')
        ]);
        
        if (isMounted) {
          if (receiptRes.ok) {
            const rJson = await receiptRes.json();
            setData(rJson.data || []);
          }
          if (typeRes.ok) {
            const tJson = await typeRes.json();
            setReceiptTypes(tJson.data || []);
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          message.error("Lỗi khi tải dữ liệu");
          setLoading(false);
        }
      }
    };
    
    loadAll();
    
    return () => { isMounted = false; };
  }, []);

  const handleOpenModal = (record?: ReceiptResponseDto, readOnly = false) => {
    setEditingRecord(record);
    setIsReadOnly(readOnly);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success("Xóa thành công");
        fetchReceipts();
      } else {
        message.error("Xóa thất bại");
      }
    } catch {
      message.error("Lỗi hệ thống");
    }
  };

  const columns: ColumnsType<ReceiptResponseDto> = [
    { title: "Số chứng từ", dataIndex: "serial", key: "serial" },
    { title: "Ngày lập", dataIndex: "createdDate", key: "createdDate", render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "" },
    { title: "Loại phiếu", key: "receiptType", render: (_, record) => record.receiptType?.name || record.receiptTypeId },
    { title: "Kho", dataIndex: "warehouse", key: "warehouse" },
    { title: "Người giao", dataIndex: "deliverName", key: "deliverName" },
    { title: "Tổng tiền", dataIndex: "totalInText", key: "totalInText" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleOpenModal(record, true)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record, false)} />
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Danh sách phiếu nhập kho" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(undefined, false)}>Tạo phiếu nhập</Button>}
      bordered={false}
    >
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <ReceiptModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReceipts}
        initialValues={editingRecord}
        receiptTypes={receiptTypes}
        readOnly={isReadOnly}
      />
    </Card>
  );
}