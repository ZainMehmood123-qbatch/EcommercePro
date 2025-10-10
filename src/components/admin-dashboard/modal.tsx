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
  Divider,
  Space
} from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import type { ProductType, ProductVariant } from '@/types/product';

const { Title } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  product: ProductType | null;
  products: ProductType[];
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
}

export default function ProductModal({
  visible,
  onClose,
  product,
  products,
  setProducts
}: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with product data or default values
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        title: product.title,
        variants: product.variants
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        variants: [
          {
            colorName: '',
            colorCode: '#000000',
            size: '',
            price: 0,
            stock: 0,
            image: ''
          }
        ]
      });
    }
  }, [product, form]);

  // Upload Image Function
  const handleImageUpload = async (file: File, _: string, index: number) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();

      const values = form.getFieldsValue();
      values.variants[index].image = url;
      form.setFieldsValue(values);

      message.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      message.error('Failed to upload image');
    }
    return false;
  };

  // Save / Update Product
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload: ProductType = { ...values };

      setLoading(true);

      let res: Response;
      if (product) {
        // Update existing product
        res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new product
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Failed to save product');
      const savedProduct: ProductType = await res.json();

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
      width={600}
      styles={{
            body: {
              maxHeight: '70vh',
              overflowY: 'auto',
              paddingRight: 16
            }
          }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading}>
          {product ? 'Update' : 'Save'}
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        {/* Product Title */}
        <Form.Item
          label="Product Name"
          name="title"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Divider orientation="left">Variants</Divider>

        {/* ✅ Variants List */}
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <div key={key} className="p-4 mb-4 border rounded-lg shadow-sm bg-gray-50">
                  <Space align="start" className="w-full">
                    {/* Image Upload */}
                    <Form.Item {...restField} name={[name, 'image']} label="Image">
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => {
                        handleImageUpload(file as File, 'image', index);
                        return false; 
                      }}
                 >
                        {form.getFieldValue(['variants', name, 'image']) ? (
                          <div className="relative w-20 h-20 rounded-lg shadow overflow-hidden cursor-pointer group">
                            <Image
                              src={form.getFieldValue(['variants', name, 'image'])}
                              alt="Variant"
                              width={80}
                              height={80}
                              style={{ objectFit: 'cover' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                              <UploadOutlined /> Change
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 flex flex-col items-center justify-center border border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-500 transition">
                            <PlusOutlined />
                            <span className="mt-1 text-xs">Upload</span>
                          </div>
                        )}
                      </Upload>
                    </Form.Item>

                    {/* Other Variant Fields */}
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Form.Item
                        {...restField}
                        name={[name, 'colorName']}
                        label="Color Name"
                        rules={[{ required: true, message: 'Enter color name' }]}
                      >
                        <Input placeholder="Red" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'colorCode']}
                        label="Color Code"
                        rules={[{ required: true, message: 'Pick color' }]}
                      >
                        <Input type="color" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'size']}
                        label="Size"
                        rules={[{ required: true, message: 'Enter size' }]}
                      >
                        <Input placeholder="M" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'price']}
                        label="Price"
                        rules={[{ required: true, message: 'Enter price' }]}
                      >
                        <InputNumber className="w-full" min={0} prefix="$" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'stock']}
                        label="Stock"
                        rules={[{ required: true, message: 'Enter stock' }]}
                      >
                        <InputNumber className="w-full" min={0} />
                      </Form.Item>
                    </div>

                    {/* Delete Variant */}
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    )}
                  </Space>
                </div>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      colorName: '',
                      colorCode: '#000000',
                      size: '',
                      price: 0,
                      stock: 0,
                      image: ''
                    } as ProductVariant)
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  Add Variant
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
