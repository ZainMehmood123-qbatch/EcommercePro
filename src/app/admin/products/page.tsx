'use client';

import { useEffect, useState, useCallback, SetStateAction } from 'react';
import { Table, Avatar, Button, message, Input, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined
} from '@ant-design/icons';

import ProductModal from '@/components/admin-dashboard/modal';
import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';
import AddMultipleProductsModal from '@/components/admin-dashboard/addmultipleproducts-modal';
import GenericDropdown, { GenericDropdownItem } from '@/components/dashboard/drop-down';

import './products.css';
import toast from 'react-hot-toast';
import { ProductType } from '@/types/product';

const productSortItems: GenericDropdownItem[] = [
  { key: 'price_asc', label: 'Price: Low to High', icon: <DollarOutlined /> },
  { key: 'price_desc', label: 'Price: High to Low', icon: <DollarOutlined /> },
  { key: 'name_asc', label: 'Name: A to Z', icon: <SortAscendingOutlined /> },
  { key: 'name_desc', label: 'Name: Z to A', icon: <SortDescendingOutlined /> },
  { key: 'newest', label: 'Newest First', icon: <CalendarOutlined /> },
  { key: 'oldest', label: 'Oldest First', icon: <CalendarOutlined /> }
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<string>('newest');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);
  const [visible, setVisible] = useState(false);

     const fetchProducts = useCallback(
        async (page: number, search = debouncedSearch, sortKey = sort) => {

          setLoading(true);
          try {
            const res = await fetch(
              `/api/products?page=${page}&limit=${limit}&search=${search}&sort=${sortKey}`
            );
            const result = await res.json();

            if (result?.data && Array.isArray(result.data)) {
              const transformed = result.data.map((p: ProductType) => {
                const firstVariant = p.variants?.[0];
                return {
                  id: p.id,
                  title: p.title,
                  price: firstVariant?.price ?? 0,
                  stock: firstVariant?.stock ?? 0,
                  image: firstVariant?.image ?? '/placeholder.png',
                  variants: p.variants || []
                };
              });

                setProducts(transformed);
                setTotal(result.total || 0);
              } else {
                setProducts([]);
                setTotal(0);
              }

      } catch (err) {
        console.error('Failed to fetch products', err);
        message.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, sort, limit]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(localSearch);
      setPageNum(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch]);

  useEffect(() => {
    fetchProducts(pageNum);
  }, [pageNum, debouncedSearch, sort, fetchProducts]);

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalVisible(true);
  };

  const handleDelete = async (record: ProductType) => {
    try {
      const res = await fetch(`/api/products/${record.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        message.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p.id !== record.id));
        setTotal((prev) => prev - 1);
        toast.success('Product deleted successfully');
      } else {
        const error = await res.json();
        message.error(`${error.error}`);
        toast.error('Product cannot be deleted');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Error deleting product');
    }
  };

  const columns: ColumnsType<ProductType> = [
    {
      title: 'Image',
      render: (record: ProductType) => (
        <Avatar
          shape="square"
          className="adp-avatar"
          src={record.variants?.[0]?.image || '/placeholder.png'}
        />
      )
    },
    { title: 'Title', dataIndex: 'title' },
    {
      title: 'Price',
      render: (record: ProductType) => `$${record.variants?.[0]?.price?.toFixed(2) ?? '0.00'}`
    },
    {
      title: 'Stock',
      render: (record: ProductType) => record.variants?.[0]?.stock ?? '-'
    },
    {
      title: 'Actions',
      render: (record: ProductType) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<EditOutlined className="!text-[#007BFF]" />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined className="!text-[#DC3545]" />}
            onClick={() => {
              setProductToDelete(record);
              setIsDeleteModalOpen(true);
            }}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="adp-whole">
      <div className="adp-nav">
        <h1 className="adp-title">Products</h1>
        <div className="flex gap-2">
          <Input.Search
            placeholder="Search products"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <GenericDropdown
            items={productSortItems}
            selectedKey={sort}
            onSelect={(val: SetStateAction<string>) => {
              setSort(val);
              setPageNum(1);
            }}
          />
          <Button type="primary" onClick={handleCreate}>
            + Add a Single Product
          </Button>
          <Button
            className="adp-addmultipleproducts"
            onClick={() => setVisible(true)}
          >
            + Add Multiple Products
          </Button>
          <AddMultipleProductsModal
            visible={visible}
            onClose={() => setVisible(false)}
          />
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        pagination={{
          current: pageNum,
          pageSize: limit,
          total: total,
          onChange: (page) => setPageNum(page)
        }}
        className="adp-wholetable"
      />

      {isModalVisible && (
        <ProductModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          product={selectedProduct}
          setProducts={setProducts}
          products={products}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          onConfirm={() => {
            if (productToDelete) {
              handleDelete(productToDelete);
            }
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          productName={productToDelete?.title}
        />
      )}
    </div>
  );
}
