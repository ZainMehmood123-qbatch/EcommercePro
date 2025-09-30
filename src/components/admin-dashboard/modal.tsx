'use client';

import React, { useState, useEffect } from 'react';

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
  const [formData, setFormData] = useState<Product>({
    id: '',
    title: '',
    price: 0,
    stock: 0,
    image: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) setFormData(product);
    else setFormData({ id: '', title: '', price: 0, stock: 0, image: '' });
  }, [product]);

  const handleChange = (field: keyof Product, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      setFormData((prev) => ({ ...prev, image: url }));
      message.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      message.error('Failed to upload image');
    }
    return false;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let res;

      if (product) {
        res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!res.ok) throw new Error('Failed to save product');
      const savedProduct: Product = await res.json();

      if (product) {
        setProducts(
          products.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
        message.success('Product updated successfully!');
      } else {
        setProducts([...products, savedProduct]);
        message.success('Product created successfully!');
      }

      onClose();
    } catch (err) {
      message.error('Something went wrong!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Title level={4} className="!mb-0">
          {product ? '✏️ Edit Product' : '➕ Add New Product'}
        </Title>
      }
      open={visible}
      onCancel={onClose}
      width={520}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          className="bg-blue-500"
          loading={loading}
        >
          {product ? 'Update' : 'Save'}
        </Button>
      ]}
    >
      <Form layout="vertical" className="space-y-3">
        <Divider orientation="left">Product Image</Divider>
        <Form.Item>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleImageUpload}
          >
            {formData.image ? (
              <div className="relative w-28 h-28 rounded-lg shadow-md overflow-hidden cursor-pointer group">
                <Image
                  src={formData.image}
                  alt="Product"
                  width={112}
                  height={112}
                  style={{ objectFit: 'cover' }}
                  fallback="/fallback.png"
                />
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
        <Form.Item label="Product Name">
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter product name"
          />
        </Form.Item>

        <Form.Item label="Price">
          <InputNumber
            value={formData.price}
            onChange={(value) => handleChange('price', value || 0)}
            placeholder="Enter price"
            className="w-full"
            prefix="$"
          />
        </Form.Item>

        <Form.Item label="Stock Quantity">
          <InputNumber
            value={formData.stock}
            onChange={(value) => handleChange('stock', value || 0)}
            placeholder="Enter stock quantity"
            className="w-full"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
