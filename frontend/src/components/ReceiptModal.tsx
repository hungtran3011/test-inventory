import { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message, Select, DatePicker, Button, Typography, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ReceiptItemDto, ReceiptResponseDto, ReceiptTypeDto } from "../models/receipt.model";
import dayjs from "dayjs";
import { numberToVietnameseText } from "../utils/currency";
import './ReceiptModal.css';

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: ReceiptResponseDto;
  receiptTypes: ReceiptTypeDto[];
  readOnly?: boolean;
}

export function ReceiptModal({ open, onClose, onSuccess, initialValues, receiptTypes, readOnly = false }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          createdDate: initialValues.createdDate ? dayjs(initialValues.createdDate) : undefined,
          sourceReceiptDate: initialValues.sourceReceiptDate ? dayjs(initialValues.sourceReceiptDate) : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleValuesChange = (changedValues: Partial<ReceiptResponseDto>, allValues: ReceiptResponseDto) => {
    if (changedValues.receiptItems) {
      let total = 0;
      allValues.receiptItems?.forEach((item: ReceiptItemDto | undefined) => {
        const qty = Number(item?.quantityByReality) || 0;
        const price = Number(item?.unitPrice) || 0;
        total += qty * price;
      });
      form.setFieldsValue({
        totalInText: numberToVietnameseText(total)
      });
    }
  };

  const handleSave = async () => {
    if (readOnly) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const url = initialValues?.id ? `/api/v1/inventory/${initialValues.id}` : '/api/v1/inventory';
      const method = initialValues?.id ? 'PUT' : 'POST';
      
      const payload = {
        companyName: values.companyName,
        departmentName: values.departmentName,
        createdDate: values.createdDate?.toISOString(),
        serial: values.serial,
        debit: values.debit,
        credit: values.credit,
        deliverName: values.deliverName,
        receiptTypeId: values.receiptTypeId,
        sourceReceiptDate: values.sourceReceiptDate?.toISOString(),
        receiptIssuer: values.receiptIssuer,
        warehouse: values.warehouse,
        location: values.location,
        attachDocument: values.attachDocument,
        totalInText: values.totalInText,
        receiptItems: values.receiptItems?.map((item: ReceiptItemDto) => ({
          ...item,
          quantityByReceipt: Number(item.quantityByReceipt),
          quantityByReality: Number(item.quantityByReality),
          unitPrice: Number(item.unitPrice),
        })) || []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      title={initialValues?.id ? (readOnly ? "Chi tiết phiếu nhập kho" : "Sửa phiếu nhập kho") : "Tạo mới phiếu nhập kho"}
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      width={1000}
      okText="Lưu"
      cancelText="Hủy"
      footer={readOnly ? [<Button key="close" type="primary" onClick={onClose}>Đóng</Button>] : undefined}
    >
      <Form form={form} className="paper-form" onValuesChange={handleValuesChange} disabled={readOnly}>
        {/* Header */}
        <Row justify="space-between">
          <Col span={8}>
            <div style={{ display: 'flex', marginBottom: 4 }}>
              <Text strong style={{ minWidth: 60, fontFamily: 'inherit' }}>Đơn vị:</Text>
              <Form.Item name="companyName" noStyle><Input style={{ flex: 1 }} /></Form.Item>
            </div>
            <div style={{ display: 'flex' }}>
              <Text strong style={{ minWidth: 60, fontFamily: 'inherit' }}>Bộ phận:</Text>
              <Form.Item name="departmentName" noStyle><Input style={{ flex: 1 }} /></Form.Item>
            </div>
          </Col>
          <Col span={10} style={{ textAlign: 'center' }}>
            <Text strong style={{ fontFamily: 'inherit' }}>Mẫu số 01 - VT</Text><br/>
            <Text italic style={{ fontFamily: 'inherit' }}>(Ban hành theo Thông tư số 200/2014/TT-BTC<br/>Ngày 22/12/2014 của Bộ Tài chính)</Text>
          </Col>
        </Row>

        {/* Title area */}
        <Row style={{ marginTop: 24 }}>
          <Col span={6}></Col>
          <Col span={12} style={{ textAlign: 'center' }}>
            <Title level={3} style={{ margin: 0, fontFamily: 'inherit' }}>PHIẾU NHẬP KHO</Title>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
              <Text italic style={{ fontFamily: 'inherit' }}>Ngày</Text>
              <Form.Item name="createdDate" noStyle><DatePicker format="DD/MM/YYYY" style={{ width: 120, margin: '0 8px' }} /></Form.Item>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontFamily: 'inherit' }}>Số:</Text>
              <Form.Item name="serial" noStyle><Input style={{ width: 120, margin: '0 8px' }} /></Form.Item>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ display: 'flex', marginBottom: 4 }}>
              <Text style={{ fontFamily: 'inherit', minWidth: 30 }}>Nợ:</Text>
              <Form.Item name="debit" noStyle><Input style={{ flex: 1 }} /></Form.Item>
            </div>
            <div style={{ display: 'flex' }}>
              <Text style={{ fontFamily: 'inherit', minWidth: 30 }}>Có:</Text>
              <Form.Item name="credit" noStyle><Input style={{ flex: 1 }} /></Form.Item>
            </div>
          </Col>
        </Row>

        {/* Info area */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'inherit' }}>- Họ và tên người giao: </Text>
            <Form.Item name="deliverName" noStyle><Input style={{ flex: 1, marginLeft: 8 }} /></Form.Item>
          </div>
          <div style={{ display: 'flex', marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: 'inherit' }}>- Theo </Text>
            <Form.Item name="receiptTypeId" noStyle>
              <Select style={{ width: 220, margin: '0 8px' }}>
                {receiptTypes.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Text style={{ fontFamily: 'inherit' }}> số </Text>
            <Form.Item name="sourceRecordNumber" noStyle><Input style={{ width: 100, margin: '0 8px' }} /></Form.Item>
            <Text style={{ fontFamily: 'inherit' }}> ngày </Text>
            <Form.Item name="sourceReceiptDate" noStyle><DatePicker format="DD/MM/YYYY" style={{ width: 130, margin: '0 8px' }} /></Form.Item>
            <Text style={{ fontFamily: 'inherit' }}> của </Text>
            <Form.Item name="sourceRecordCompany" noStyle><Input style={{ flex: 1, minWidth: 100, marginLeft: 8 }} /></Form.Item>
          </div>
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'inherit' }}>- Nhập tại kho: </Text>
            <Form.Item name="warehouse" noStyle><Input style={{ width: 200, margin: '0 8px' }} /></Form.Item>
            <Text style={{ fontFamily: 'inherit' }}> địa điểm: </Text>
            <Form.Item name="location" noStyle><Input style={{ flex: 1, marginLeft: 8 }} /></Form.Item>
          </div>
        </div>

        {/* Table area */}
        <table className="paper-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: 40 }}>STT</th>
              <th rowSpan={2}>Tên, nhãn hiệu, quy cách,<br/>phẩm chất vật tư,<br/>dụng cụ sản phẩm, hàng hoá</th>
              <th rowSpan={2} style={{ width: 80 }}>Mã số</th>
              <th rowSpan={2} style={{ width: 60 }}>Đơn<br/>vị<br/>tính</th>
              <th colSpan={2}>Số lượng</th>
              <th rowSpan={2} style={{ width: 90 }}>Đơn giá (VNĐ)</th>
              <th rowSpan={2} style={{ width: 100 }}>Thành tiền (VNĐ)</th>
              {!readOnly && <th rowSpan={2} style={{ width: 40 }}></th>}
            </tr>
            <tr>
              <th style={{ width: 70 }}>Theo<br/>chứng từ</th>
              <th style={{ width: 70 }}>Thực<br/>nhập</th>
            </tr>
            <tr style={{ background: '#f5f5f5' }}>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              {!readOnly && <th></th>}
            </tr>
          </thead>
          <Form.List name="receiptItems">
            {(fields, { add, remove }) => (
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.key}>
                    <td>{index + 1}</td>
                    <td><Form.Item name={[field.name, 'item']} noStyle><Input /></Form.Item></td>
                    <td><Form.Item name={[field.name, 'code']} noStyle><Input /></Form.Item></td>
                    <td><Form.Item name={[field.name, 'unit']} noStyle><Input /></Form.Item></td>
                    <td><Form.Item name={[field.name, 'quantityByReceipt']} noStyle><Input type="number" /></Form.Item></td>
                    <td><Form.Item name={[field.name, 'quantityByReality']} noStyle><Input type="number" /></Form.Item></td>
                    <td>
                      <Form.Item name={[field.name, 'unitPrice']} noStyle>
                        <InputNumber 
                          style={{ width: '100%', border: 'none', boxShadow: 'none' }} 
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                          parser={(value) => value ? value.replace(/\$\s?|(\.*)/g, '') : ''}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item shouldUpdate={(prev, curr) => 
                        prev.receiptItems?.[field.name]?.quantityByReality !== curr.receiptItems?.[field.name]?.quantityByReality ||
                        prev.receiptItems?.[field.name]?.unitPrice !== curr.receiptItems?.[field.name]?.unitPrice
                      } noStyle>
                        {() => {
                          const qty = form.getFieldValue(['receiptItems', field.name, 'quantityByReality']) || 0;
                          const price = form.getFieldValue(['receiptItems', field.name, 'unitPrice']) || 0;
                          return <Text style={{ fontFamily: 'inherit' }}>{(qty * price).toLocaleString('vi-VN')}</Text>
                        }}
                      </Form.Item>
                    </td>
                    {!readOnly && <td><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} /></td>}
                  </tr>
                ))}
                {!readOnly && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'left', padding: '8px' }}>
                      <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>Thêm hàng hoá</Button>
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </Form.List>
        </table>

        {/* Footer area */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'inherit' }}>- Tổng số tiền (viết bằng chữ): </Text>
            <Form.Item name="totalInText" noStyle><Input style={{ flex: 1, marginLeft: 8 }} /></Form.Item>
          </div>
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'inherit' }}>- Số chứng từ gốc kèm theo: </Text>
            <Form.Item name="attachDocument" noStyle><Input style={{ flex: 1, marginLeft: 8 }} /></Form.Item>
          </div>
        </div>

        {/* Signatures */}
        <Row style={{ marginTop: 32, textAlign: 'center' }}>
          <Col span={6}>
            <Text strong style={{ fontFamily: 'inherit' }}>Người lập phiếu</Text><br/>
            <Text italic style={{ fontFamily: 'inherit' }}>(Ký, họ tên)</Text><br/><br/><br/><br/>
            <Form.Item name="receiptIssuer" noStyle><Input style={{ textAlign: 'center' }} /></Form.Item>
          </Col>
          <Col span={6}>
            <Text strong style={{ fontFamily: 'inherit' }}>Người giao hàng</Text><br/>
            <Text italic style={{ fontFamily: 'inherit' }}>(Ký, họ tên)</Text>
          </Col>
          <Col span={6}>
            <Text strong style={{ fontFamily: 'inherit' }}>Thủ kho</Text><br/>
            <Text italic style={{ fontFamily: 'inherit' }}>(Ký, họ tên)</Text>
          </Col>
          <Col span={6}>
            <Text italic style={{ fontFamily: 'inherit' }}>Ngày ... tháng ... năm ...</Text><br/>
            <Text strong style={{ fontFamily: 'inherit' }}>Kế toán trưởng</Text><br/>
            <Text italic style={{ fontFamily: 'inherit' }}>(Hoặc bộ phận có nhu cầu nhập)</Text><br/>
            <Text italic style={{ fontFamily: 'inherit' }}>(Ký, họ tên)</Text>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
