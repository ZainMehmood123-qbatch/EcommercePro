'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

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
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons';
import toast from 'react-hot-toast';

import { useDispatch } from 'react-redux';

import type { ProductType, ProductVariant } from '@/types/product';
import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';
import { AppDispatch } from '@/store';
import {
  createProduct,
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant
} from '@/store/slice/products-slice';

const { Title } = Typography;

interface Props {
  visible: boolean;
  onClose: () => void;
  product: ProductType | null;
  products: ProductType[];
  setProducts: Dispatch<SetStateAction<ProductType[]>>;
}

const ProductModal: React.FC<Props> = ({ visible, onClose, product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [originalValues, setOriginalValues] = useState<Record<number, ProductVariant>>({});

  // Prefill form when product changes
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
    setEditingIndex(null);
    setOriginalValues({});
  }, [product, form]);

  // Image upload handler
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
      // eslint-disable-next-line no-console
      console.error(err);
      message.error('Failed to upload image');
    }

    return false;
  };

  // Delete variant
  const handleDeleteVariant = async () => {
    if (variantToDelete === null) return;
    const variant = form.getFieldValue(['variants', variantToDelete]);

    if (!variant?.id) return;

    try {
      setLoading(true);
      await dispatch(deleteVariant({ productId: product!.id, variantId: variant.id })).unwrap();
      const values = form.getFieldsValue();

      values.variants.splice(variantToDelete, 1);
      form.setFieldsValue(values);
      toast.success('Variant deleted successfully!');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      message.error('Failed to delete variant!');
    } finally {
      setDeleteModalOpen(false);
      setVariantToDelete(null);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      if (product) {
        await dispatch(updateProduct({ id: product.id, title: values.title })).unwrap();
        toast.success('Product updated');
      } else {
        const payload = {
          title: values.title,
          ...(values.variants?.length ? { variants: values.variants } : {})
        };

        await dispatch(createProduct(payload)).unwrap();
        toast.success('Product created');
      }

      onClose();
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : 'Error saving product';

      toast.error(message);
      // eslint-disable-next-line no-console
      console.error('Save product error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Variant editing logic
  const handleStartEdit = (index: number) => {
    if (editingIndex !== null && editingIndex !== index) {
      const prev = editingIndex;
      const values = form.getFieldsValue();

      if (originalValues[prev]) {
        values.variants[prev] = originalValues[prev];
        form.setFieldsValue(values);
      }
    }

    const currentValues = form.getFieldValue(['variants', index]);

    setOriginalValues((prev) => ({ ...prev, [index]: { ...currentValues } }));
    setEditingIndex(index);
  };

  const handleSaveEdit = async (index: number) => {
    try {
      const variant: ProductVariant = form.getFieldValue(['variants', index]);

      setLoading(true);

      if (variant.id) {
        await dispatch(updateVariant(variant)).unwrap();
        toast.success(`Variant ${index + 1} updated`);
      } else if (product?.id) {
        const newVariant = await dispatch(
          createVariant({ productId: product.id, variant })
        ).unwrap();
        const values = form.getFieldsValue();

        values.variants[index] = newVariant;
        form.setFieldsValue(values);
        toast.success('New variant added');
      }

      setEditingIndex(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      message.error('Failed to save variant');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = (index: number) => {
    const values = form.getFieldsValue();

    if (originalValues[index]) {
      values.variants[index] = originalValues[index];
      form.setFieldsValue(values);
    }
    setEditingIndex(null);
  };

  return (
    <Modal
      footer={[
        <Button key={'cancel'} onClick={onClose}>
          Cancel
        </Button>,
        <Button key={'save'} loading={loading} type={'primary'} onClick={handleSave}>
          {product ? 'Update Product' : 'Save Product'}
        </Button>
      ]}
      open={visible}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 16 } }}
      title={<Title level={4}>{product ? '✏️ Edit Product' : '➕ Add New Product'}</Title>}
      width={650}
      onCancel={onClose}
    >
      <Form form={form} layout={'vertical'}>
        <Form.Item
          label={'Product Name'}
          name={'title'}
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder={'Enter product name'} />
        </Form.Item>

        <Divider orientation={'left'}>Variants</Divider>

        <Form.List name={'variants'}>
          {(fields, { add }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => {
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={key}
                    className={'p-4 mb-4 border rounded-lg shadow-sm bg-gray-50 relative'}
                  >
                    <Space align={'start'} className={'w-full'}>
                      {/* Image Upload */}
                      <Form.Item {...restField} label={'Image'} name={[name, 'image']}>
                        <Upload
                          accept={'image/*'}
                          beforeUpload={(file) => {
                            handleImageUpload(file as File, 'image', index);

                            return false;
                          }}
                          disabled={!isEditing}
                          showUploadList={false}
                        >
                          {form.getFieldValue(['variants', name, 'image']) ? (
                            <div
                              className={
                                'relative w-20 h-20 rounded-lg shadow overflow-hidden cursor-pointer group'
                              }
                            >
                              <Image
                                alt={'Variant'}
                                height={80}
                                src={form.getFieldValue(['variants', name, 'image'])}
                                style={{ objectFit: 'cover' }}
                                width={80}
                              />
                              {isEditing ? (
                                <div
                                  className={
                                    'absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition'
                                  }
                                >
                                  <UploadOutlined /> Change
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div
                              className={`w-20 h-20 flex flex-col items-center justify-center border border-dashed rounded-lg ${
                                isEditing
                                  ? 'cursor-pointer hover:border-blue-500 hover:text-blue-500 transition'
                                  : 'cursor-not-allowed opacity-50'
                              }`}
                            >
                              <PlusOutlined />
                              <span className={'mt-1 text-xs'}>Upload</span>
                            </div>
                          )}
                        </Upload>
                      </Form.Item>

                      {/* Variant Fields */}
                      <div className={'flex-1 grid grid-cols-2 gap-3'}>
                        <Form.Item
                          {...restField}
                          label={'Color Name'}
                          name={[name, 'colorName']}
                          rules={[{ required: true, message: 'Enter color name' }]}
                        >
                          <Input disabled={!isEditing} placeholder={'Red'} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Color Code'}
                          name={[name, 'colorCode']}
                          rules={[{ required: true, message: 'Pick color' }]}
                        >
                          <Input disabled={!isEditing} type={'color'} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Size'}
                          name={[name, 'size']}
                          rules={[{ required: true, message: 'Enter size' }]}
                        >
                          <Input disabled={!isEditing} placeholder={'M'} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Price'}
                          name={[name, 'price']}
                          rules={[{ required: true, message: 'Enter price' }]}
                        >
                          <InputNumber
                            className={'w-full'}
                            disabled={!isEditing}
                            min={0}
                            prefix={'$'}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Stock'}
                          name={[name, 'stock']}
                          rules={[{ required: true, message: 'Enter stock' }]}
                        >
                          <InputNumber className={'w-full'} disabled={!isEditing} min={0} />
                        </Form.Item>
                      </div>

                      <div className={'flex flex-col gap-2'}>
                        {isEditing ? (
                          <>
                            <Button
                              className={'text-green-600 hover:bg-green-50'}
                              type={'text'}
                              onClick={() => handleSaveEdit(index)}
                            >
                              Save
                            </Button>
                            <Button
                              icon={<CloseOutlined />}
                              type={'text'}
                              onClick={() => handleCancelEdit(index)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            className={'!text-blue-600 hover:!bg-blue-50'}
                            icon={<EditOutlined />}
                            type={'text'}
                            onClick={() => handleStartEdit(index)}
                          >
                            Edit
                          </Button>
                        )}

                        {fields.length > 1 ? (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            type={'text'}
                            onClick={() => {
                              setVariantToDelete(name);
                              setDeleteModalOpen(true);
                            }}
                          />
                        ) : null}
                      </div>
                    </Space>
                  </div>
                );
              })}

              <Form.Item>
                <Button
                  block
                  icon={<PlusOutlined />}
                  type={'dashed'}
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
                >
                  Add Variant
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        productName={'this variant'}
        onClose={() => {
          setDeleteModalOpen(false);
          setVariantToDelete(null);
        }}
        onConfirm={handleDeleteVariant}
      />
    </Modal>
  );
};

export default ProductModal;
