import { useEffect, useState } from "react";
import { Table, Button, Space, Card, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ReceiptTypeDto } from "../models/receipt.model";
import { ReceiptTypeModal } from "./ReceiptTypeModal";

export function ConfigReceiptType() {
  const [data, setData] = useState<ReceiptTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceiptTypeDto | undefined>(undefined);

  const fetchReceiptTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/receipt-types/all');
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
      }
    } catch (e) {
      message.error("Lỗi khi tải dữ liệu");
      console.error(e)
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/receipt-types/all')
      .then(res => res.ok ? res.json() : { data: [] })
      .then(json => {
        if (isMounted) {
          setData(json.data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          message.error("Lỗi khi tải dữ liệu");
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  const handleOpenModal = (record?: ReceiptTypeDto) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/receipt-types/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success("Xóa thành công");
        fetchReceiptTypes();
      } else {
        message.error("Xóa thất bại");
      }
    } catch (e) {
      message.error("Lỗi hệ thống");
      console.error(e);
    }
  };

  const columns: ColumnsType<ReceiptTypeDto> = [
    {
      title: "Mã loại chứng từ",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên loại chứng từ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id!)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Cấu hình loại phiếu nhập" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm mới</Button>}
      bordered={false}
    >
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />

      <ReceiptTypeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchReceiptTypes}
        initialValues={editingRecord}
      />
    </Card>
  );
}
