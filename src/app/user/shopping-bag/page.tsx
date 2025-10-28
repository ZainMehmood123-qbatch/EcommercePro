'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Flex, Table, InputNumber, Image, Spin } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { clearCart, getCartItems, updateCart } from '@/lib/cart';
import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';
import { CartItem } from '@/types/cart';
import Navbar from '@/components/common/navbar';

import './shopping-bag.css';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

const Shoppingbag: React.FC = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Load cart items
  useEffect(() => {
    if (!userId) return;
    setItems(getCartItems(userId));
  }, [userId]);

  // Keep localStorage synced
  useEffect(() => {
    if (!userId) return;
    updateCart(userId, items);
  }, [items, userId]);

  // Update quantity
  const updateQty = (key: React.Key, newQty: number) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.key === key) {
          if (newQty > item.stock) {
            console.log(item.stock);
            toast.error(`Only ${item.stock} items available in stock`);
            return { ...item, qty: item.stock };
          }
          return { ...item, qty: Math.max(1, newQty) };
        }
        return item;
      });
      if (userId) updateCart(userId, updated);
      return updated;
    });
  };

  // Delete single item
  const deleteItem = (key: React.Key) => {
    if (!userId) return;
    setItems((prev) => {
      const updated = prev.filter((item) => item.key !== key);
      updateCart(userId, updated);
      return updated;
    });
    toast.success('Item deleted');
  };

  // Delete selected items
  const deleteSelectedItems = () => {
    if (!selectedRowKeys.length) {
      toast.error('No items selected');
      return;
    }
    if (!userId) return;

    setItems((prev) => {
      const updated = prev.filter((item) => !selectedRowKeys.includes(item.key));
      updateCart(userId, updated);
      return updated;
    });

    setSelectedRowKeys([]);
    toast.success('Selected items deleted');
  };

  // Checkout (Stripe)
  const handlePlaceOrder = async () => {

    if(loading) return;
    setLoading(true);
    if (!items.length) {
      toast.error('Your cart is empty!');
      return;
    }

    const subTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const tax = subTotal * 0.1;
    const total = subTotal + tax;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      if (userId) clearCart(userId);
      toast.success('Redirecting to checkout...');
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      toast.error('Checkout failed. Try again!');
      setLoading(false);
    }
  };

  // Table columns (styled)
  const columns: TableColumnsType<CartItem> = [
    {
      title: 'Product',
      dataIndex: 'product',
      className: '!pl-1',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Image
            src={record.image || '/fallback.png'}
            alt="product"
            width={24}
            height={24}
            preview={{ mask: <span>Preview</span> }}
            fallback="/fallback.png"
            style={{ objectFit: 'cover' }}
          />
          <span className="sb-pvalues">{record.product}</span>
        </div>
      )
    },
    {
      title: 'Color',
      dataIndex: 'colorName',
      render: (_, record) => {
        if (!record.colorName && !record.colorCode) {
          return <span className="sb-productcolorname">White</span>;
        }
        return (
          <div className="sb-colors">
            {record.colorCode && (
              <span
                className="sb-productcolorcode"
                style={{ backgroundColor: record.colorCode }}
              ></span>
            )}
            <span className="sb-pvalues">
              {record.colorName || record.colorCode}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Size',
      dataIndex: 'size',
      render: (value) => <span className="sb-pvalues">{value ?? 'L'}</span>
    },
    {
      title: 'Price Per Unit',
      dataIndex: 'price',
      render: (price) => <span className="sb-pvalues">Rs. {price}</span>
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      render: (_, record) => (
        <Flex align="center" gap="small">
          <Button
            size="small"
            className="sb-signcolors"
            onClick={() => updateQty(record.key, record.qty - 1)}
            disabled={record.qty <= 1}
          >
            -
          </Button>
          <InputNumber
            min={1}
            max={record.stock}
            value={record.qty}
            className="sb-number"
            onChange={(value) => updateQty(record.key, value || 1)}
          />
          <Button
            size="small"
            className="sb-signcolors"
            onClick={() => updateQty(record.key, record.qty + 1)}
            disabled={record.qty >= record.stock}
          >
            +
          </Button>
        </Flex>
      )
    },
    {
      title: 'Total Price',
      dataIndex: 'total',
      render: (_, record) => (
        <span className="sb-pvalues">
          Rs. {(record.qty * record.price).toLocaleString()}
        </span>
      )
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => {
            setItemToDelete(record);
            setIsModalOpen(true);
          }}
        />
      )
    }
  ];

  const rowSelection: TableRowSelection<CartItem> = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  const subTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subTotal * 0.1;
  const total = subTotal + tax;

  if (status === 'loading') {
    return (
      <div className="loader">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Flex gap="middle" vertical className="sb-innerbody">
        <Flex align="center" gap="middle">
          <div className="sb-innerbodyy">
            <Link href="/">
              <ArrowLeftOutlined className="sb-arrowleft" />
            </Link>
            <h4 className="sb-title">Your Shopping Bag</h4>
          </div>
        </Flex>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-20 space-y-4">
            <p className="text-gray-500 text-base">No items in cart</p>
            <Link href="/">
              <Button type="primary" className="!bg-white !text-[#007BFF] !text-md !p-6 !rounded-none !border-[#e1e1e1]">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Table<CartItem>
              rowSelection={rowSelection}
              columns={columns}
              dataSource={items}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 950 }}
              bordered
              rowClassName={() => 'h-12'}
              className="sb-wholetable"
            />

            <div className="sb-summary">
              <p>
                Sub Total: <b>Rs. {subTotal.toLocaleString()}</b>
              </p>
              <p>
                Tax: <b>Rs. {tax.toLocaleString()} (10%)</b>
              </p>
              <p>
                Total: <b>Rs. {total.toLocaleString()}</b>
              </p>
              <div className="sb-buttons">
                <Button
                  danger
                  size="large"
                  className="!mb-3"
                  disabled={!selectedRowKeys.length}
                  onClick={deleteSelectedItems}
                >
                  Delete Selected
                </Button>
                  <Button
                  type="primary"
                  size="large"
                  className="sb-placeorder"
                  onClick={handlePlaceOrder}
                  loading={loading} 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </>
        )}

        {isModalOpen && (
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              if (itemToDelete) deleteItem(itemToDelete.key);
              setIsModalOpen(false);
              setItemToDelete(null);
            }}
            productName={itemToDelete?.product}
          />
        )}
      </Flex>
    </>
  );
};

export default Shoppingbag;
