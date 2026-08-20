import { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import type { ReceiptTypeDto } from "../models/receipt.model";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: ReceiptTypeDto;
}

export function ReceiptTypeModal({ open, onClose, onSuccess, initialValues }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const url = initialValues?.id ? `/api/v1/receipt-types/${initialValues.id}` : '/api/v1/receipt-types';
      const method = initialValues?.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        message.success("Lưu thành công");
        onSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        message.error(errorData.message || "Lưu thất bại");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialValues?.id ? "Sửa loại chứng từ" : "Thêm mới loại chứng từ"}
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="code" label="Mã loại chứng từ" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Tên loại chứng từ" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
