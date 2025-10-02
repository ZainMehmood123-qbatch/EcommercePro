'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Card, Button, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ExportOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  DollarOutlined
} from '@ant-design/icons';

import SearchComponent from '@/components/dashboard/search-bar';
import { OrderType, FetchedOrder, FetchedOrderItem } from '@/types/order';

import './orderss.css';

interface ApiResponse {
  orders: (FetchedOrder & { items: FetchedOrderItem[] })[];
  totalCount: number;
  page: number;
  limit: number;
  stats: {
    totalOrders: number;
    totalUnits: number;
    totalAmount: number;
  };
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [loading, setLoading] = useState(false); 
  const [initialLoading, setInitialLoading] = useState(true); 

  const [pageNum, setPageNum] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [localSearch, setLocalSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(localSearch);
      setPageNum(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  const fetchOrders = async (page: number, search: string, isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      );
      const result: ApiResponse = await res.json();

      const mappedOrders: OrderType[] = result.orders.map((o) => ({
        key: o.id,
        id: o.id,
        orderNo: `ORD-${o.id.slice(0, 8)}`,
        date: new Date(o.createdAt).toLocaleDateString(),
        user: o.userId ? `USR-${o.userId.slice(0, 8)}` : 'Me',
        products: o.items?.length || 0,
        amount: o.items?.reduce((sum, i) => sum + i.price * i.qty, 0) || 0
      }));

      setOrders(mappedOrders);
      setTotal(result.totalCount);
      setTotalOrders(result.stats.totalOrders);
      setTotalUnits(result.stats.totalUnits);
      setTotalAmount(result.stats.totalAmount);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      if (isInitial) setInitialLoading(false);
      else setLoading(false);
    }
  };

  // First load (full-page loader)
  useEffect(() => {
    fetchOrders(pageNum, debouncedSearch, true);
  }, []);

  // After first load → search & pagination
  useEffect(() => {
    if (!initialLoading) {
      fetchOrders(pageNum, debouncedSearch);
    }
  }, [pageNum, debouncedSearch]);

  const columns: ColumnsType<OrderType> = [
    { title: 'Date', dataIndex: 'date' },
    { title: 'Order #', dataIndex: 'orderNo' },
    { title: 'User', dataIndex: 'user' },
    { title: 'Product(s)', dataIndex: 'products' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (a: number) => `$${a.toFixed(2)}`
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: unknown, record: OrderType) => (
        <Link href={`/user/order-details/${record.id}`}>
          <Button
            type='text'
            icon={<ExportOutlined />}
            className='ado-actionbutton'
          />
        </Link>
      )
    }
  ];

  if (initialLoading) {
    return (
      <div className="loader">
        <Spin size="large" tip="Loading orders..." />
      </div>
    );
  }

  return (
    <div className='ado-whole' style={{ position: 'relative' }}>
      {loading && (
        <div className="loader-overlay">
          <Spin size="large" tip="Loading..." />
        </div>
      )}

      <div className='ado-uppergrid'>
        <Card className='p-1'>
          <div className='ado-cards'>
            <div>
              <p className='ado-cardtitles'>Total Orders:</p>
              <h2 className='ado-cardcontent'>{totalOrders}</h2>
            </div>
            <div className='ado-cardicons'>
              <ShoppingCartOutlined />
            </div>
          </div>
        </Card>
        <Card className='p-1'>
          <div className='ado-cards'>
            <div>
              <p className='ado-cardtitles'>Total Units:</p>
              <h2 className='ado-cardcontent'>{totalUnits}</h2>
            </div>
            <div className='ado-cardicons'>
              <AppstoreOutlined />
            </div>
          </div>
        </Card>
        <Card className='p-1'>
          <div className='ado-cards'>
            <div>
              <p className='ado-cardtitles'>Total Amount:</p>
              <h2 className='ado-cardcontent'>
                ${totalAmount.toLocaleString()}
              </h2>
            </div>
            <div className='ado-cardicons'>
              <DollarOutlined />
            </div>
          </div>
        </Card>
      </div>

      <div className='ado-innernav'>
        <h1 className='ado-title'>Orders</h1>
        <SearchComponent
          searchTerm={localSearch}
          setSearchTerm={setLocalSearch}
          placeholder='Search by user and orderID'
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        className='ado-wholetable'
        pagination={{
          current: pageNum,
          pageSize: limit,
          total: total,
          onChange: (page) => setPageNum(page)
        }}
      />
    </div>
  );
};

export default OrdersPage;
