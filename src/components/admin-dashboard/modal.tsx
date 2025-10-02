'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Input,
  InputNumber,
  Button,
  Form,
  message,
  Upload,
  Image,
  Typography,
  Divider
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

const { Title } = Typography;

interface Product {
  id: string;
  title: string;
  price: number;
  stock?: number;
  image?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export default function ProductModal({
  visible,
  onClose,
  product,
  setProducts,
  products
}: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
      setImage(product.image || '');
    } else {
      form.resetFields();
      setImage('');
    }
  }, [product, form]);

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      setImage(url);
      message.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      message.error('Failed to upload image');
    }
    return false;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!image) {
        message.error('Product image is required!');
        return;
      }

      const payload = { ...values, image };
      setLoading(true);

      let res;
      if (product) {
        res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Failed to save product');
      const savedProduct: Product = await res.json();

      if (product) {
        setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
        message.success('Product updated successfully!');
        toast.success('Product updated successfully');
      } else {
        setProducts([...products, savedProduct]);
        message.success('Product created successfully!');
        toast.success('Product created successfully');
      }

      onClose();
    } catch (err) {
      console.error(err);
      message.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>{product ? '✏️ Edit Product' : '➕ Add New Product'}</Title>}
      open={visible}
      onCancel={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading}>
          {product ? 'Update' : 'Save'}
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Divider orientation="left">Product Image</Divider>
        <Form.Item>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleImageUpload}
          >
            {image ? (
              <div className="relative w-28 h-28 rounded-lg shadow-md overflow-hidden cursor-pointer group">
                <Image src={image} alt="Product" width={112} height={112} style={{ objectFit: 'cover' }} fallback="/fallback.png"/>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                  <UploadOutlined /> Change
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 flex flex-col items-center justify-center border border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-500 transition">
                <PlusOutlined />
                <span className="mt-1 text-xs">Upload</span>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Divider orientation="left">Product Details</Divider>

        <Form.Item
          label="Product Name"
          name="title"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[
            { required: true, message: 'Please enter product price' },
            { type: 'number', min: 0.01, message: 'Price must be greater than 0' }
          ]}
        >
          <InputNumber className="w-full" placeholder="Enter price" prefix="$"/>
        </Form.Item>

        <Form.Item
          label="Stock Quantity"
          name="stock"
          rules={[
            { required: true, message: 'Please enter stock quantity' },
            { type: 'number', min: 0, message: 'Stock cannot be negative' }
          ]}
        >
          <InputNumber className="w-full" placeholder="Enter stock quantity"/>
        </Form.Item>
      </Form>
    </Modal>
  );
}
