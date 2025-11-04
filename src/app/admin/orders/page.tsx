'use client';

import { useEffect, useState } from 'react';

import {
  AppstoreOutlined,
  DollarOutlined,
  ExportOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { Button, Card, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import toast from 'react-hot-toast';

import SearchComponent from '@/components/dashboard/search-bar';
import OrderDetailsSidebar from '@/components/OrderDetailsSidebar';

import { FetchedOrder, FetchedOrderItem, OrderType } from '@/types/order';

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

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

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
        amount: o.items?.reduce((sum, i) => sum + i.price * i.qty, 0) || 0,
        paymentStatus: o.paymentStatus || 'PENDING'
      }));

      setOrders(mappedOrders);
      setTotal(result.totalCount);
      setTotalOrders(result.stats.totalOrders);
      setTotalUnits(result.stats.totalUnits);
      setTotalAmount(result.stats.totalAmount);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch orders', err);
    } finally {
      if (isInitial) setInitialLoading(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pageNum, debouncedSearch, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      fetchOrders(pageNum, debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, debouncedSearch]);

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedOrderId(null);
  };

  const handleMarkCompleted = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus: 'COMPLETED' })
      });

      if (res.ok) {
        toast.success('Order marked as completed successfully!');
        await fetchOrders(pageNum, debouncedSearch);
      } else {
        toast.error('Failed to update order status.');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating order:', error);
      toast.error('Something went wrong.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
      title: 'Status',
      dataIndex: 'status',
      render: (_, record: OrderType) => {
        const status = record.paymentStatus?.toUpperCase();

        // eslint-disable-next-line no-console
        console.log('status is', status);
        const color = status === 'PENDING' ? 'orange' : status === 'PAID' ? 'green' : 'blue';

        return (
          <span
            style={{
              color,
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {status}
          </span>
        );
      }
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (_: unknown, record: OrderType) => (
        <div className={'flex gap-2'}>
          <Button
            className={'hover:bg-blue-50 hover:text-blue-600 transition-all'}
            icon={<ExportOutlined />}
            type={'text'}
            onClick={() => handleViewOrderDetails(record.id)}
          />
          {record.paymentStatus === 'PAID' ? (
            <Button
              className={
                '!bg-green-500 !border-green-500 hover:!bg-green-600 hover:!border-green-600 transition-all duration-200'
              }
              loading={updatingOrderId === record.id}
              type={'primary'}
              onClick={() => handleMarkCompleted(record.id)}
            >
              {updatingOrderId === record.id ? 'Updating...' : <>Mark Completed</>}
            </Button>
          ) : null}
        </div>
      )
    }
  ];

  if (initialLoading) {
    return (
      <div className={'loader'}>
        <Spin size={'large'} />
      </div>
    );
  }

  return (
    <div className={'ado-whole'} style={{ position: 'relative' }}>
      {loading ? (
        <div className={'loader-overlay'}>
          <Spin size={'large'} />
        </div>
      ) : null}

      <div className={'ado-uppergrid'}>
        <Card className={'p-1'}>
          <div className={'ado-cards'}>
            <div>
              <p className={'ado-cardtitles'}>Total Orders:</p>
              <h2 className={'ado-cardcontent'}>{totalOrders}</h2>
            </div>
            <div className={'ado-cardicons'}>
              <ShoppingCartOutlined />
            </div>
          </div>
        </Card>
        <Card className={'p-1'}>
          <div className={'ado-cards'}>
            <div>
              <p className={'ado-cardtitles'}>Total Units:</p>
              <h2 className={'ado-cardcontent'}>{totalUnits}</h2>
            </div>
            <div className={'ado-cardicons'}>
              <AppstoreOutlined />
            </div>
          </div>
        </Card>
        <Card className={'p-1'}>
          <div className={'ado-cards'}>
            <div>
              <p className={'ado-cardtitles'}>Total Amount:</p>
              <h2 className={'ado-cardcontent'}>${totalAmount.toLocaleString()}</h2>
            </div>
            <div className={'ado-cardicons'}>
              <DollarOutlined />
            </div>
          </div>
        </Card>
      </div>

      <div className={'ado-innernav'}>
        <h1 className={'ado-title'}>Orders</h1>
        <SearchComponent
          placeholder={'Search by user and orderID'}
          searchTerm={localSearch}
          setSearchTerm={setLocalSearch}
        />
      </div>
      <Table
        className={'ado-wholetable'}
        columns={columns}
        dataSource={orders}
        pagination={{
          current: pageNum,
          pageSize: limit,
          total: total,
          onChange: (page) => setPageNum(page)
        }}
        rowKey={'id'}
      />

      <OrderDetailsSidebar
        open={sidebarOpen}
        orderId={selectedOrderId}
        onClose={handleCloseSidebar}
      />
    </div>
  );
};

export default OrdersPage;
