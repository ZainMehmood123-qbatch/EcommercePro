'use client';

import React, { useState, useEffect } from 'react';

import Link from 'next/link';

import { useSession } from 'next-auth/react';
import { Button, Flex, Table, InputNumber, Image, Spin } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [stockErrors, setStockErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (stockErrors.length > 0) {
      setStockErrors([]);
    }
  }, [items]);

  useEffect(() => {
    if (!userId) return;
    setItems(getCartItems(userId));
  }, [userId]);

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

  const deleteItem = (key: React.Key) => {
    if (!userId) return;
    setItems((prev) => {
      const updated = prev.filter((item) => item.key !== key);

      updateCart(userId, updated);

      return updated;
    });
    toast.success('Item deleted');
  };

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

  const handlePlaceOrder = async () => {
    if (loading || isProcessing) return;
    setLoading(true);
    setIsProcessing(true);

    if (!items.length) {
      toast.error('Your cart is empty!');
      setLoading(false);
      setIsProcessing(false);

      return;
    }

    // Prevent redundant API hit if cart already has known stock issues
    const outOfStockItems = items.filter(
      (item) => item.qty > (item.availableStock ?? item.stock ?? 0)
    );

    if (outOfStockItems.length > 0) {
      outOfStockItems.forEach((item) => {
        const available = item.availableStock ?? item.stock ?? 0;

        toast.error(`${item.product} — only ${available} left in stock`);
      });
      setLoading(false);
      setIsProcessing(false);

      return;
    }

    const subTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const tax = subTotal * 0.1;
    const total = subTotal + tax;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Strip frontend-only fields like availableStock before sending
          items: items.map(({ availableStock, ...rest }) => rest),
          total
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data?.error || 'Checkout failed due to stock issue.';

        // Update local cart with the latest stock info if API returns it
        if (data?.updatedStocks?.length) {
          setItems((prev) =>
            prev.map((item) => {
              const match = data.updatedStocks.find(
                (s: { variantId: string }) => s.variantId === item.variantId
              );

              return match ? { ...item, availableStock: match.availableStock } : item;
            })
          );

          // Show stock updates for all affected products
          const combinedMsg = data.updatedStocks
            .map(
              (s: {
                productName: CartItem;
                colorName: CartItem;
                size: CartItem;
                availableStock: CartItem;
              }) =>
                `${s.productName} (${s.colorName || ''} ${s.size || ''}) — only ${
                  s.availableStock
                } left in stock`
            )
            .join('\n');

          toast.error(`⚠️ Stock updated:\n${combinedMsg}`, {
            duration: 7000
          });
        }

        throw new Error(message);
      }

      // Success flow — clear cart & redirect
      if (userId) clearCart(userId);
      toast.success('Redirecting to checkout...');
      window.location.href = data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed. Try again!';

      toast.error(errorMessage);
      setIsProcessing(false); // allow retry on error
    } finally {
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
        <div className={'flex items-center gap-2'}>
          <Image
            alt={'product'}
            fallback={'/fallback.png'}
            height={24}
            preview={{ mask: <span>Preview</span> }}
            src={record.image || '/fallback.png'}
            style={{ objectFit: 'cover' }}
            width={24}
          />
          <span className={'sb-pvalues'}>{record.product}</span>
        </div>
      )
    },
    {
      title: 'Color',
      dataIndex: 'colorName',
      render: (_, record) => {
        if (!record.colorName && !record.colorCode) {
          return <span className={'sb-productcolorname'}>White</span>;
        }

        return (
          <div className={'sb-colors'}>
            {record.colorCode ? (
              <span
                className={'sb-productcolorcode'}
                style={{ backgroundColor: record.colorCode }}
              />
            ) : null}
            <span className={'sb-pvalues'}>{record.colorName || record.colorCode}</span>
          </div>
        );
      }
    },
    {
      title: 'Size',
      dataIndex: 'size',
      render: (value) => <span className={'sb-pvalues'}>{value ?? 'L'}</span>
    },
    {
      title: 'Price Per Unit',
      dataIndex: 'price',
      render: (price) => <span className={'sb-pvalues'}>Rs. {price}</span>
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      render: (_, record) => (
        <Flex align={'center'} gap={'small'}>
          <Button
            className={'sb-signcolors'}
            disabled={record.qty <= 1}
            size={'small'}
            onClick={() => updateQty(record.key, record.qty - 1)}
          >
            -
          </Button>
          <InputNumber
            className={'sb-number'}
            max={record.stock}
            min={1}
            value={record.qty}
            onChange={(value) => updateQty(record.key, value || 1)}
          />
          <Button
            className={'sb-signcolors'}
            disabled={record.qty >= record.stock}
            size={'small'}
            onClick={() => updateQty(record.key, record.qty + 1)}
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
        <span className={'sb-pvalues'}>Rs. {(record.qty * record.price).toLocaleString()}</span>
      )
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          type={'text'}
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
      <div className={'loader'}>
        <Spin size={'large'} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Flex vertical className={'sb-innerbody'} gap={'middle'}>
        <Flex align={'center'} gap={'middle'}>
          <div className={'sb-innerbodyy'}>
            <Link href={'/'}>
              <ArrowLeftOutlined className={'sb-arrowleft'} />
            </Link>
            <h4 className={'sb-title'}>Your Shopping Bag</h4>
          </div>
        </Flex>

        {items.length === 0 ? (
          <div className={'flex flex-col items-center justify-center text-center mt-20 space-y-4'}>
            <p className={'text-gray-500 text-base'}>No items in cart</p>
            <Link href={'/'}>
              <Button
                className={
                  '!bg-white !text-[#007BFF] !text-md !p-6 !rounded-none !border-[#e1e1e1]'
                }
                type={'primary'}
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Table<CartItem>
              bordered
              className={'sb-wholetable'}
              columns={columns}
              dataSource={items}
              pagination={{ pageSize: 10 }}
              rowClassName={() => 'h-12'}
              rowSelection={rowSelection}
              scroll={{ x: 950 }}
            />

            <div className={'sb-summary'}>
              <p>
                Sub Total: <b>Rs. {subTotal.toLocaleString()}</b>
              </p>
              <p>
                Tax: <b>Rs. {tax.toLocaleString()} (10%)</b>
              </p>
              <p>
                Total: <b>Rs. {total.toLocaleString()}</b>
              </p>
              <div className={'sb-buttons'}>
                <Button
                  danger
                  className={'!mb-3'}
                  disabled={!selectedRowKeys.length}
                  size={'large'}
                  onClick={deleteSelectedItems}
                >
                  Delete Selected
                </Button>
                <Button
                  className={'sb-placeorder'}
                  disabled={loading || isProcessing}
                  loading={loading}
                  size={'large'}
                  type={'primary'}
                  onClick={handlePlaceOrder}
                >
                  {loading || isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </>
        )}

        {isModalOpen ? (
          <DeleteConfirmationModal
            isOpen={isModalOpen}
            productName={itemToDelete?.product}
            onClose={() => setIsModalOpen(false)}
            onConfirm={() => {
              if (itemToDelete) deleteItem(itemToDelete.key);
              setIsModalOpen(false);
              setItemToDelete(null);
            }}
          />
        ) : null}
        {loading ? (
          <div
            className={
              'fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm'
            }
          >
            <Spin size={'large'} tip={'Processing your order...'} />
          </div>
        ) : null}
      </Flex>
    </>
  );
};

export default Shoppingbag;
