'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Flex, Table, InputNumber, message, Image, Spin } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import DeleteConfirmationModal from '@/components/dashboard/delete-confirmation-modal';
import { CartItem } from '@/types/cart';

import './shopping-bag.css';
import Navbar from '@/components/common/navbar';

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

const Shoppingbag: React.FC = () => {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) {
      //setLoading(false);
      return;
    }

    const cartKey = `cart-${session.user.id}`;
    const stored = localStorage.getItem(cartKey);

    if (stored) {
      setItems(JSON.parse(stored) as CartItem[]);
    }

    //setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const cartKey = `cart-${session.user.id}`;
    if (items.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    } else {
      localStorage.removeItem(cartKey);
    }
  }, [items, session?.user?.id]);

  const updateQty = (key: React.Key, newQty: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          if (newQty > item.stock) {
            toast.error(`Only ${item.stock} items available in stock`);
            return { ...item, qty: item.stock };
          }
          return { ...item, qty: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const deleteItem = (key: React.Key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const deleteSelectedItems = () => {
    if (!selectedRowKeys.length) {
      toast.error('No items selected');
      return;
    }
    setItems((prev) => prev.filter((item) => !selectedRowKeys.includes(item.key)));
    setSelectedRowKeys([]);
    toast.success('Selected items deleted');
  };

  const handlePlaceOrder = async () => {
    if (!items.length) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  items: items.map(i => ({
    productId: i.id,        // main product ID
    variantId: i.variantId, // variant ID
    qty: i.qty,
    price: i.price,
    colorName: i.colorName,
    colorCode: i.colorCode,
    size: i.size
  }))
})
      });

      if (!res.ok) throw new Error('Failed to place order');

      toast.success('Order placed successfully!');
      setItems([]);
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('Dont have enough stock.');
      message.error('Something went wrong. Try again!');
    }
  };

  const columns: TableColumnsType<CartItem> = [
    {
      title: 'Product',
      dataIndex: 'product',
      className: '!pl-1',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Image
            src={record.image}
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
      dataIndex: 'priceperunit',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span className="sb-pvalues">{record.price}</span>
        </div>
      )
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
      dataIndex: 'total price',
      render: (_, record) => (
        <span className="sb-pvalues">
          ${(record.qty * record.price).toFixed(2)}
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

  // if (loading) {
  //   return (
  //     <div className="loader">
  //       <Spin size="large" />
  //     </div>
  //   );
  // }

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
              Sub Total: <b>${subTotal.toFixed(2)}</b>
            </p>
            <p>
              Tax: <b>${tax.toFixed(2)} (10%)</b>
            </p>
            <p>
              Total: <b>${total.toFixed(2)}</b>
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
              >
                Place Order
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
            if (itemToDelete) {
              deleteItem(itemToDelete.key);
            }
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