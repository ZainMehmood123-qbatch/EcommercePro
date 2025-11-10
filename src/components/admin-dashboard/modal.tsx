'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  Modal,
  Input,
  InputNumber,
  Button,
  Form,
  Upload,
  Image,
  Typography,
  Divider,
  Space,
  Switch,
  message
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

const { Title, Text } = Typography;

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
  const [hasUnsavedVariant, setHasUnsavedVariant] = useState(false);

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
      message.success('Image uploaded');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
    } catch (err) {
      message.error('Failed to upload image');
    }

    return false;
  };

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
      toast.success('Variant deleted');
    } catch {
      message.error('Failed to delete variant');
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else if (typeof err === 'string') {
        toast.error(err);
      } else {
        toast.error('Error saving product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (index: number) => {
    const currentValues = form.getFieldValue(['variants', index]);

    setOriginalValues((prev) => ({ ...prev, [index]: { ...currentValues } }));
    setEditingIndex(index);
  };

  const handleSaveEdit = async (index: number) => {
    try {
      const variant: ProductVariant = form.getFieldValue(['variants', index]);
      const allVariants: ProductVariant[] = form.getFieldValue(['variants']);

      const isDuplicate = allVariants.some((v, i) => {
        if (i === index) return false;

        return (
          v.colorName.trim().toLowerCase() === variant.colorName.trim().toLowerCase() &&
          v.size.trim().toLowerCase() === variant.size.trim().toLowerCase()
        );
      });

      if (isDuplicate) return toast.error('Duplicate color and size');

      setLoading(true);

      if (variant.id) {
        await dispatch(updateVariant(variant)).unwrap();
        toast.success('Variant updated');
      } else if (product?.id) {
        const newVariant = await dispatch(
          createVariant({ productId: product.id, variant })
        ).unwrap();
        const values = form.getFieldsValue();

        values.variants[index] = newVariant;
        form.setFieldsValue(values);
        toast.success('New variant added');
      }
      setHasUnsavedVariant(false);

      setEditingIndex(null);
    } catch {
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
      footer={
        <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button loading={loading} type={'primary'} onClick={handleSave}>
            {product ? 'Update' : 'Save'}
          </Button>
        </Space>
      }
      open={visible}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 12 } }}
      title={<Title level={4}>{product ? 'Edit Product' : 'Add New Product'}</Title>}
      width={600}
      onCancel={onClose}
    >
      <Form form={form} layout={'vertical'}>
        <Form.Item
          label={'Product Name'}
          name={'title'}
          rules={[{ required: true, message: 'Enter product name' }]}
        >
          <Input placeholder={'Enter product name'} />
        </Form.Item>

        <Divider>Variants</Divider>

        <Form.List name={'variants'}>
          {(fields, { add }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => {
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={key}
                    className={
                      'rounded-lg border border-gray-200 bg-white p-4 mb-3 transition hover:shadow-sm'
                    }
                  >
                    <Space wrap align={'start'} className={'w-full'}>
                      <Form.Item {...restField} name={[name, 'image']}>
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
                            <Image
                              alt={'Variant'}
                              height={80}
                              preview={false}
                              src={form.getFieldValue(['variants', name, 'image'])}
                              style={{
                                borderRadius: 8,
                                objectFit: 'cover',
                                cursor: isEditing ? 'pointer' : 'not-allowed'
                              }}
                              width={80}
                            />
                          ) : (
                            <Button disabled={!isEditing} icon={<UploadOutlined />} type={'dashed'}>
                              Upload
                            </Button>
                          )}
                        </Upload>
                      </Form.Item>

                      <div className={'flex-1 grid grid-cols-2 gap-3'}>
                        <Form.Item
                          {...restField}
                          label={'Color Name'}
                          name={[name, 'colorName']}
                          rules={[{ required: true }]}
                        >
                          <Input disabled={!isEditing} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Color Code'}
                          name={[name, 'colorCode']}
                          rules={[{ required: true }]}
                        >
                          <Input disabled={!isEditing} type={'color'} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Size'}
                          name={[name, 'size']}
                          rules={[{ required: true }]}
                        >
                          <Input disabled={!isEditing} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label={'Price'}
                          name={[name, 'price']}
                          rules={[{ required: true }]}
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
                          rules={[{ required: true }]}
                        >
                          <InputNumber className={'w-full'} disabled={!isEditing} min={0} />
                        </Form.Item>
                      </div>
                    </Space>

                    <div className={'flex items-center justify-between mt-3'}>
                      <Space>
                        <Switch
                          checked={!form.getFieldValue(['variants', name, 'isDeleted'])}
                          size={'small'}
                          onChange={async (checked) => {
                            const variant = form.getFieldValue(['variants', name]);

                            if (!variant.id) return;

                            try {
                              setLoading(true);
                              const updated = await dispatch(
                                updateVariant({
                                  ...variant,
                                  isDeleted: !checked
                                })
                              ).unwrap();
                              const values = form.getFieldsValue();

                              values.variants[name] = updated;
                              form.setFieldsValue(values);
                              toast.success(`Variant ${checked ? 'activated' : 'deactivated'}`);
                            } catch {
                              message.error('Failed to update status');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        />
                        <Text className={'text-xs'} type={'secondary'}>
                          {form.getFieldValue(['variants', name, 'isDeleted'])
                            ? 'Inactive'
                            : 'Active'}
                        </Text>
                      </Space>

                      <Space>
                        {isEditing ? (
                          <>
                            <Button
                              size={'small'}
                              type={'primary'}
                              onClick={() => handleSaveEdit(index)}
                            >
                              Save
                            </Button>
                            <Button
                              icon={<CloseOutlined />}
                              size={'small'}
                              onClick={() => handleCancelEdit(index)}
                            />
                          </>
                        ) : (
                          <Button
                            icon={<EditOutlined />}
                            size={'small'}
                            onClick={() => handleStartEdit(index)}
                          >
                            Edit
                          </Button>
                        )}
                        {fields.length > 1 ? (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            size={'small'}
                            onClick={() => {
                              const variant = form.getFieldValue(['variants', name]);

                              if (variant?.id) {
                                setVariantToDelete(name);
                                setDeleteModalOpen(true);
                              } else {
                                const values = form.getFieldsValue();

                                values.variants.splice(name, 1);
                                form.setFieldsValue(values);

                                setHasUnsavedVariant(false);
                              }
                            }}
                          />
                        ) : null}
                      </Space>
                    </div>
                  </div>
                );
              })}

              <Button
                block
                disabled={hasUnsavedVariant}
                icon={<PlusOutlined />}
                type={'dashed'}
                onClick={() => {
                  if (hasUnsavedVariant) {
                    toast.error('Please save the current variant before adding another');

                    return;
                  }

                  add({
                    colorName: '',
                    colorCode: '#000000',
                    size: '',
                    price: 0,
                    stock: 0,
                    image: ''
                  } as ProductVariant);
                  setHasUnsavedVariant(true);
                }}
              >
                Add Variant
              </Button>
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
