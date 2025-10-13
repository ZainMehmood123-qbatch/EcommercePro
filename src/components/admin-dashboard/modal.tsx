// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Modal,
//   Input,
//   InputNumber,
//   Button,
//   Form,
//   message,
//   Upload,
//   Image,
//   Typography,
//   Divider,
//   Space
// } from 'antd';
// import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
// import toast from 'react-hot-toast';
// import type { ProductType, ProductVariant } from '@/types/product';
// import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';


// const { Title } = Typography;

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   product: ProductType | null;
//   products: ProductType[];
//   setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
// }

// export default function ProductModal({
//   visible,
//   onClose,
//   product,
//   products,
//   setProducts
// }: Props) {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [originalValues, setOriginalValues] = useState<Record<number, ProductVariant>>({});

//   useEffect(() => {
//     if (product) {
//       form.setFieldsValue({
//         title: product.title,
//         variants: product.variants
//       });
//     } else {
//       form.resetFields();
//       form.setFieldsValue({
//         variants: [
//           {
//             colorName: '',
//             colorCode: '#000000',
//             size: '',
//             price: 0,
//             stock: 0,
//             image: ''
//           }
//         ]
//       });
//     }
//   }, [product, form]);

//   // Upload Image Function
//   const handleImageUpload = async (file: File, _: string, index: number) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const res = await fetch('/api/upload', { method: 'POST', body: formData });
//       if (!res.ok) throw new Error('Upload failed');

//       const { url } = await res.json();

//       const values = form.getFieldsValue();
//       values.variants[index].image = url;
//       form.setFieldsValue(values);

//       message.success('Image uploaded successfully!');
//     } catch (err) {
//       console.error(err);
//       message.error('Failed to upload image');
//     }
//     return false;
//   };


//   const handleDeleteVariant = async () => {
//     if (variantToDelete === null) return;

//     const variantId = form.getFieldValue(['variants', variantToDelete, 'id']);

//     try {
//       if (variantId) {
//         const res = await fetch(`/api/variants/${variantId}`, {
//           method: 'DELETE'
//         });
//         if (!res.ok) throw new Error('Failed to delete variant');
//         toast.success('Variant deleted successfully!');
//         message.success('Variant deleted successfully!');
//       }
//       const values = form.getFieldsValue();
//       values.variants.splice(variantToDelete, 1);
//       form.setFieldsValue(values);
//     } catch (error) {
//       console.error(error);
//       message.error('Failed to delete variant!');
//     } finally {
//       setDeleteModalOpen(false);
//       setVariantToDelete(null);
//     }
//   };

//   // Save / Update Product
//   const handleSave = async () => {
//     try {
//       const values = await form.validateFields();
//       const payload: ProductType = { ...values };

//       setLoading(true);

//       let res: Response;
//       if (product) {
//         // Update existing product
//         res = await fetch(`/api/products/${product.id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload)
//         });
//       } else {
//         // Create new product
//         res = await fetch('/api/products', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload)
//         });
//       }

//       if (!res.ok) throw new Error('Failed to save product');
//       const savedProduct: ProductType = await res.json();

//       if (product) {
//         setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
//         message.success('Product updated successfully!');
//         toast.success('Product updated successfully');
//       } else {
//         setProducts([...products, savedProduct]);
//         message.success('Product created successfully!');
//         toast.success('Product created successfully');
//       }

//       onClose();
//     } catch (err) {
//       console.error(err);
//       message.error('Something went wrong!');
//     } finally {
//       setLoading(false);
//     }
//   };

//    const handleStartEdit = (index: number) => {
//       // If switching from another variant, reset it
//       if (editingIndex !== null && editingIndex !== index) {
//         const prev = editingIndex;
//         const values = form.getFieldsValue();
//         if (originalValues[prev]) {
//           // Restore old values for the previously edited variant
//           values.variants[prev] = originalValues[prev];
//           form.setFieldsValue(values);
//         }
//       }

//       // Store original values for current card
//       const values = form.getFieldValue(['variants', index]);
//       setOriginalValues((prev) => ({ ...prev, [index]: { ...values } }));

//       // Activate editing
//       setEditingIndex(index);
//     };

//     const handleSaveEdit = (index: number) => {
//       setEditingIndex(null);
//       message.success(`Variant ${index + 1} saved`);
//     };

//     const handleCancelEdit = (index: number) => {
//       const values = form.getFieldsValue();
//       if (originalValues[index]) {
//         values.variants[index] = originalValues[index];
//         form.setFieldsValue(values);
//       }
//       setEditingIndex(null);
//     };


//   return (
//     <Modal
//       title={<Title level={4}>{product ? '✏️ Edit Product' : '➕ Add New Product'}</Title>}
//       open={visible}
//       onCancel={onClose}
//       width={600}
//       styles={{
//         body: {
//           maxHeight: '70vh',
//           overflowY: 'auto',
//           paddingRight: 16
//         }
//       }}
//       footer={[
//         <Button key="cancel" onClick={onClose}>
//           Cancel
//         </Button>,
//         <Button key="save" type="primary" onClick={handleSave} loading={loading}>
//           {product ? 'Update' : 'Save'}
//         </Button>
//       ]}
//     >
//       <Form form={form} layout="vertical">
//         {/* Product Title */}
//         <Form.Item
//           label="Product Name"
//           name="title"
//           rules={[{ required: true, message: 'Please enter product name' }]}
//         >
//           <Input placeholder="Enter product name" />
//         </Form.Item>

//         <Divider orientation="left">Variants</Divider>
//         <Form.List name="variants">
//           {(fields, { add }) => (
//             <>
//               {/* {fields.map(({ key, name, ...restField }, index) => (
//                 <div key={key} className="p-4 mb-4 border rounded-lg shadow-sm bg-gray-50">
//                   <Space align="start" className="w-full">
//                     <Form.Item {...restField} name={[name, 'image']} label="Image">
//                       <Upload
//                         accept="image/*"
//                         showUploadList={false}
//                         beforeUpload={(file) => {
//                           handleImageUpload(file as File, 'image', index);
//                           return false;
//                         }}
//                       >
//                         {form.getFieldValue(['variants', name, 'image']) ? (
//                           <div className="relative w-20 h-20 rounded-lg shadow overflow-hidden cursor-pointer group">
//                             <Image
//                               src={form.getFieldValue(['variants', name, 'image'])}
//                               alt="Variant"
//                               width={80}
//                               height={80}
//                               style={{ objectFit: 'cover' }}
//                             />
//                             <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
//                               <UploadOutlined /> Change
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="w-20 h-20 flex flex-col items-center justify-center border border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:text-blue-500 transition">
//                             <PlusOutlined />
//                             <span className="mt-1 text-xs">Upload</span>
//                           </div>
//                         )}
//                       </Upload>
//                     </Form.Item>

//                     <div className="flex-1 grid grid-cols-2 gap-3">
//                       <Form.Item
//                         {...restField}
//                         name={[name, 'colorName']}
//                         label="Color Name"
//                         rules={[{ required: true, message: 'Enter color name' }]}
//                       >
//                         <Input placeholder="Red" />
//                       </Form.Item>

//                       <Form.Item
//                         {...restField}
//                         name={[name, 'colorCode']}
//                         label="Color Code"
//                         rules={[{ required: true, message: 'Pick color' }]}
//                       >
//                         <Input type="color" />
//                       </Form.Item>

//                       <Form.Item
//                         {...restField}
//                         name={[name, 'size']}
//                         label="Size"
//                         rules={[{ required: true, message: 'Enter size' }]}
//                       >
//                         <Input placeholder="M" />
//                       </Form.Item>

//                       <Form.Item
//                         {...restField}
//                         name={[name, 'price']}
//                         label="Price"
//                         rules={[{ required: true, message: 'Enter price' }]}
//                       >
//                         <InputNumber className="w-full" min={0} prefix="$" />
//                       </Form.Item>

//                       <Form.Item
//                         {...restField}
//                         name={[name, 'stock']}
//                         label="Stock"
//                         rules={[{ required: true, message: 'Enter stock' }]}
//                       >
//                         <InputNumber className="w-full" min={0} />
//                       </Form.Item>
//                     </div>

//                     {fields.length > 1 && (
//                       <Button
//                         type="text"
//                         danger
//                         icon={<DeleteOutlined />}
//                         onClick={() => {
//                           setVariantToDelete(name);
//                           setDeleteModalOpen(true);
//                         }}
//                       />
//                     )}

//                   </Space>
//                 </div>
//               ))} */}
              
//               {fields.map(({ key, name, ...restField }, index) => {
              


//   const isEditing = editingIndex === index;

//   return (
//     <div key={key} className="p-4 mb-4 border rounded-lg shadow-sm bg-gray-50 relative">
//       <Space align="start" className="w-full">
//         {/* Image Upload */}
//         <Form.Item {...restField} name={[name, 'image']} label="Image">
//           <Upload
//             accept="image/*"
//             showUploadList={false}
//             disabled={!isEditing}
//             beforeUpload={(file) => {
//               handleImageUpload(file as File, 'image', index);
//               return false;
//             }}
//           >
//             {form.getFieldValue(['variants', name, 'image']) ? (
//               <div className="relative w-20 h-20 rounded-lg shadow overflow-hidden cursor-pointer group">
//                 <Image
//                   src={form.getFieldValue(['variants', name, 'image'])}
//                   alt="Variant"
//                   width={80}
//                   height={80}
//                   style={{ objectFit: 'cover' }}
//                 />
//                 {isEditing && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
//                     <UploadOutlined /> Change
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className={`w-20 h-20 flex flex-col items-center justify-center border border-dashed rounded-lg ${isEditing ? 'cursor-pointer hover:border-blue-500 hover:text-blue-500 transition' : 'cursor-not-allowed opacity-50'}`}>
//                 <PlusOutlined />
//                 <span className="mt-1 text-xs">Upload</span>
//               </div>
//             )}
//           </Upload>
//         </Form.Item>

//         {/* Fields */}
//         <div className="flex-1 grid grid-cols-2 gap-3">
//           <Form.Item
//             {...restField}
//             name={[name, 'colorName']}
//             label="Color Name"
//             rules={[{ required: true, message: 'Enter color name' }]}
//           >
//             <Input placeholder="Red" disabled={!isEditing} />
//           </Form.Item>

//           <Form.Item
//             {...restField}
//             name={[name, 'colorCode']}
//             label="Color Code"
//             rules={[{ required: true, message: 'Pick color' }]}
//           >
//             <Input type="color" disabled={!isEditing} />
//           </Form.Item>

//           <Form.Item
//             {...restField}
//             name={[name, 'size']}
//             label="Size"
//             rules={[{ required: true, message: 'Enter size' }]}
//           >
//             <Input placeholder="M" disabled={!isEditing} />
//           </Form.Item>

//           <Form.Item
//             {...restField}
//             name={[name, 'price']}
//             label="Price"
//             rules={[{ required: true, message: 'Enter price' }]}
//           >
//             <InputNumber className="w-full" min={0} prefix="$" disabled={!isEditing} />
//           </Form.Item>

//           <Form.Item
//             {...restField}
//             name={[name, 'stock']}
//             label="Stock"
//             rules={[{ required: true, message: 'Enter stock' }]}
//           >
//             <InputNumber className="w-full" min={0} disabled={!isEditing} />
//           </Form.Item>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col gap-2">
//           {isEditing ? (
//             <Button
//               type="text"
//               className="text-green-600 hover:bg-green-50"
//               onClick={() => setEditingIndex(null)}
//             >
//               Save
//             </Button>
//           ) : (
//             <Button
//               type="text"
//               icon={<UploadOutlined />}
//               className="!text-blue-600 hover:!bg-blue-50"
//               onClick={() => setEditingIndex(index)}
//             >
//               Edit
//             </Button>
//           )}

//           {fields.length > 1 && (
//             <Button
//               type="text"
//               danger
//               icon={<DeleteOutlined />}
//               onClick={() => {
//                 setVariantToDelete(name);
//                 setDeleteModalOpen(true);
//               }}
//             />
//           )}
//         </div>
//       </Space>
//     </div>
//   );
// })}



//               <Form.Item>
//                 <Button
//                   type="dashed"
//                   onClick={() =>
//                     add({
//                       colorName: '',
//                       colorCode: '#000000',
//                       size: '',
//                       price: 0,
//                       stock: 0,
//                       image: ''
//                     } as ProductVariant)
//                   }
//                   block
//                   icon={<PlusOutlined />}
//                 >
//                   Add Variant
//                 </Button>
//               </Form.Item>
//             </>
//           )}
//         </Form.List>
//       </Form>
//       <DeleteConfirmationModal
//         isOpen={deleteModalOpen}
//         onClose={() => {
//           setDeleteModalOpen(false);
//           setVariantToDelete(null);
//         }}
//         onConfirm={handleDeleteVariant}
//         productName="this variant"
//       />

//     </Modal>
//   );
// }





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
import {
  PlusOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import type { ProductType, ProductVariant } from '@/types/product';
import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [originalValues, setOriginalValues] = useState<Record<number, ProductVariant>>({});

  // Prefill form
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
      console.error(err);
      message.error('Failed to upload image');
    }
    return false;
  };

  // Delete variant
  const handleDeleteVariant = async () => {
    if (variantToDelete === null) return;
    const variantId = form.getFieldValue(['variants', variantToDelete, 'id']);
console.log('Deleting variant ID:', variantId);
    try {
      if (variantId) {
        const res = await fetch(`/api/variants/${variantId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete variant');
        toast.success('Variant deleted successfully!');
      }

      const values = form.getFieldsValue();
      values.variants.splice(variantToDelete, 1);
      form.setFieldsValue(values);
    } catch (error) {
      console.error(error);
      message.error('Failed to delete variant!');
    } finally {
      setDeleteModalOpen(false);
      setVariantToDelete(null);
    }
  };

  // --- API HANDLERS ---
const updateVariant = async (variant: ProductVariant) => {
  if (!variant.id) return;
  const res = await fetch(`/api/variants/${variant.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variant)
  });
  if (!res.ok) throw new Error('Failed to update variant');
  return res.json();
};

const createVariant = async (productId: string, variant: ProductVariant) => {
  const res = await fetch('/api/variants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...variant, productId })
  });
  if (!res.ok) throw new Error('Failed to create variant');
  return res.json();
};

  // Save / Update Product
const handleSave = async () => {
  try {
    const { title } = await form.validateFields(['title']);
    if (!title) return;
    setLoading(true);
    const payload = { title };

    let res: Response;
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
        // body: JSON.stringify({ ...payload, variants: [] })
        body: JSON.stringify(payload)

      });
    }

    if (!res.ok) throw new Error('Failed to save product');
    const savedProduct: ProductType = await res.json();

    if (product) {
      setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      toast.success('Product updated');
    } else {
      setProducts([...products, savedProduct]);
      toast.success('Product created');
    }

    onClose();
  } catch (err) {
    console.error(err);
    message.error('Error saving product');
  } finally {
    setLoading(false);
  }
};

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
    const variant = form.getFieldValue(['variants', index]);
    setLoading(true);

    if (variant.id) {
      await updateVariant(variant);
      toast.success(`Variant ${index + 1} updated`);
    } else if (product?.id) {
      const newVariant = await createVariant(product.id, variant);
      const values = form.getFieldsValue();
      values.variants[index] = newVariant;
      form.setFieldsValue(values);
      toast.success('New variant added');
    }

    setEditingIndex(null);
  } catch (err) {
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
      title={<Title level={4}>{product ? '✏️ Edit Product' : '➕ Add New Product'}</Title>}
      open={visible}
      onCancel={onClose}
      width={650}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: 16 }
      }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={loading}>
          {product ? 'Update Product' : 'Save Product'}
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Product Name"
          name="title"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Divider orientation="left">Variants</Divider>

        <Form.List name="variants">
          {(fields, { add }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => {
                const isEditing = editingIndex === index;
                return (
                  <div
                    key={key}
                    className="p-4 mb-4 border rounded-lg shadow-sm bg-gray-50 relative"
                  >
                    <Space align="start" className="w-full">
                      {/* Image Upload */}
                      <Form.Item {...restField} name={[name, 'image']} label="Image">
                        <Upload
                          accept="image/*"
                          showUploadList={false}
                          disabled={!isEditing}
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
                              {isEditing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition">
                                  <UploadOutlined /> Change
                                </div>
                              )}
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
                              <span className="mt-1 text-xs">Upload</span>
                            </div>
                          )}
                        </Upload>
                      </Form.Item>

                      {/* Variant Fields */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Form.Item
                          {...restField}
                          name={[name, 'colorName']}
                          label="Color Name"
                          rules={[{ required: true, message: 'Enter color name' }]}
                        >
                          <Input placeholder="Red" disabled={!isEditing} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'colorCode']}
                          label="Color Code"
                          rules={[{ required: true, message: 'Pick color' }]}
                        >
                          <Input type="color" disabled={!isEditing} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'size']}
                          label="Size"
                          rules={[{ required: true, message: 'Enter size' }]}
                        >
                          <Input placeholder="M" disabled={!isEditing} />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          label="Price"
                          rules={[{ required: true, message: 'Enter price' }]}
                        >
                          <InputNumber
                            className="w-full"
                            min={0}
                            prefix="$"
                            disabled={!isEditing}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'stock']}
                          label="Stock"
                          rules={[{ required: true, message: 'Enter stock' }]}
                        >
                          <InputNumber className="w-full" min={0} disabled={!isEditing} />
                        </Form.Item>
                      </div>
                      <div className="flex flex-col gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              type="text"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => handleSaveEdit(index)}
                            >
                              Save
                            </Button>
                            <Button
                              type="text"
                              icon={<CloseOutlined />}
                              onClick={() => handleCancelEdit(index)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            className="!text-blue-600 hover:!bg-blue-50"
                            onClick={() => handleStartEdit(index)}
                          >
                            Edit
                          </Button>
                        )}

                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              setVariantToDelete(name);
                              setDeleteModalOpen(true);
                            }}
                          />
                        )}
                      </div>
                    </Space>
                  </div>
                );
              })}

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

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setVariantToDelete(null);
        }}
        onConfirm={handleDeleteVariant}
        productName="this variant"
      />
    </Modal>
  );
}
