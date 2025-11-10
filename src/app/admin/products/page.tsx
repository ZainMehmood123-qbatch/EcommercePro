'use client';

import { useEffect, useState, useCallback } from 'react';

import { Table, Avatar, Button, message, Input, Skeleton, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  CalendarOutlined
} from '@ant-design/icons';

import ProductModal from '@/components/admin-dashboard/modal';
import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';
import AddMultipleProductsModal from '@/components/admin-dashboard/addmultipleproducts-modal';
import GenericDropdown, { GenericDropdownItem } from '@/components/dashboard/drop-down';

import './products.css';
import { ProductType } from '@/types/product';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  deleteProduct,
  fetchProducts,
  resetProducts,
  setPage,
  setSearch,
  setSort
} from '@/store/slice/products-slice';

const productSortItems: GenericDropdownItem[] = [
  { key: 'name_asc', label: 'Name: A to Z', icon: <SortAscendingOutlined /> },
  { key: 'name_desc', label: 'Name: Z to A', icon: <SortDescendingOutlined /> },
  { key: 'newest', label: 'Newest First', icon: <CalendarOutlined /> },
  { key: 'oldest', label: 'Oldest First', icon: <CalendarOutlined /> }
];

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const { products, page, total, search, sort, loading } = useAppSelector(
    (state) => state.products
  );

  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedSearch, setDebouncedSearch] = useState(localSearch);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);
  const [visible, setVisible] = useState(false);

  // Fetch products
  const loadProducts = useCallback(
    (pageToLoad: number) => {
      dispatch(fetchProducts({ page: pageToLoad, search: debouncedSearch, sort, limit: 12 }));
    },
    [dispatch, debouncedSearch, sort]
  );

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(localSearch);
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  // Sync redux search state
  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Fetch when search or sort changes
  useEffect(() => {
    dispatch(resetProducts());
    loadProducts(1);
  }, [debouncedSearch, sort, dispatch, loadProducts]);

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalVisible(true);
  };

  const handleDelete = (record: ProductType) => {
    dispatch(deleteProduct(record.id))
      .unwrap()
      .then(() => {
        message.success('Product deleted successfully');
      })
      .catch((err) => {
        message.error(err || 'Failed to delete product');
      });
  };

  const columns: ColumnsType<ProductType> = [
    {
      title: 'Image',
      render: (record: ProductType) => (
        <Avatar
          className={'adp-avatar'}
          shape={'square'}
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
        <div className={'flex gap-2'}>
          <Tooltip title={'Edit Product'}>
            <Button
              icon={<EditOutlined className={'!text-[#007BFF]'} />}
              type={'text'}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={'Delete Product'}>
            <Button
              icon={<DeleteOutlined className={'!text-[#DC3545]'} />}
              type={'text'}
              onClick={() => {
                setProductToDelete(record);
                setIsDeleteModalOpen(true);
              }}
            />
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <div className={'adp-whole'}>
      <div className={'adp-nav'}>
        <h1 className={'adp-title'}>Products</h1>
        <div className={'flex gap-2 items-center'}>
          {loading ? (
            <>
              <Skeleton.Input
                active
                style={{ width: 200, height: 40, borderRadius: 8, transition: 'opacity 0.3s ease' }}
              />
              <Skeleton.Button
                active
                style={{ width: 160, height: 40, borderRadius: 8, transition: 'opacity 0.3s ease' }}
              />
              <Skeleton.Button
                active
                style={{ width: 180, height: 40, borderRadius: 8, transition: 'opacity 0.3s ease' }}
              />
              <Skeleton.Button
                active
                style={{ width: 220, height: 40, borderRadius: 8, transition: 'opacity 0.3s ease' }}
              />
            </>
          ) : (
            <>
              <Input.Search
                placeholder={'Search products'}
                style={{ width: 200 }}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              <GenericDropdown
                items={productSortItems}
                selectedKey={sort}
                onSelect={(val: string) => {
                  dispatch(setSort(val));
                }}
              />
              <Button type={'primary'} onClick={handleCreate}>
                + Add a Single Product
              </Button>
              <Button className={'adp-addmultipleproducts'} onClick={() => setVisible(true)}>
                + Add Multiple Products
              </Button>
              <AddMultipleProductsModal visible={visible} onClose={() => setVisible(false)} />
            </>
          )}
        </div>
      </div>

      <Table
        className={'adp-wholetable'}
        columns={columns}
        dataSource={products}
        loading={loading}
        pagination={{
          current: page,
          pageSize: 12,
          total: total,
          onChange: (p) => {
            dispatch(setPage(p));
            loadProducts(p);
          }
        }}
        rowKey={'id'}
      />

      {isModalVisible ? (
        <ProductModal
          product={selectedProduct}
          products={products}
          setProducts={function (): void {
            throw new Error('Function not implemented.');
          }}
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />
      ) : null}

      {isDeleteModalOpen ? (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          productName={productToDelete?.title}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          onConfirm={() => {
            if (productToDelete) handleDelete(productToDelete);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default ProductsPage;
