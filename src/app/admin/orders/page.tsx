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

import { useDispatch, useSelector } from 'react-redux';

import SearchComponent from '@/components/dashboard/search-bar';
import OrderDetailsSidebar from '@/components/OrderDetailsSidebar';
import { FetchedOrder } from '@/types/order';

import { RootState, AppDispatch } from '@/store';
import { fetchOrders, setPage, markOrderCompleted } from '@/store/slice/orders-slice';

import './orderss.css';

const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: orders,
    totalCount,
    currentPage,
    stats,
    loading
  } = useSelector((state: RootState) => state.orders);

  const [initialLoading, setInitialLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(localSearch), 500);

    return () => clearTimeout(handler);
  }, [localSearch]);

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      await dispatch(fetchOrders({ page: currentPage, limit: 10, search: debouncedSearch }));
      setInitialLoading(false);
    };

    load();
  }, [dispatch, currentPage, debouncedSearch]);

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
      const res = await dispatch(markOrderCompleted(orderId));

      if (markOrderCompleted.fulfilled.match(res)) {
        toast.success('Order marked as completed!');
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

  const columns: ColumnsType<FetchedOrder> = [
    { title: 'Date', dataIndex: 'createdAt', render: (v) => new Date(v).toLocaleDateString() },
    { title: 'Order #', render: (_, r) => `ORD-${r.id.slice(0, 8)}` },
    { title: 'User', render: (_, r) => (r.userId ? `USR-${r.userId.slice(0, 8)}` : 'Me') },
    { title: 'Product(s)', render: (_, r) => r.items?.length || 0 },
    {
      title: 'Amount',
      render: (_, r) =>
        `$${(r.items?.reduce((sum, i) => sum + i.price * i.qty, 0) ?? 0).toFixed(2)}`
    },
    {
      title: 'Status',
      render: (_, r) => {
        const status = r.paymentStatus?.toUpperCase();
        const color = status === 'PENDING' ? 'orange' : status === 'PAID' ? 'green' : 'blue';

        return (
          <span style={{ color, fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
        );
      }
    },
    {
      title: 'Actions',
      render: (_, r) => (
        <div className={'flex gap-2'}>
          <Button
            className={'hover:bg-blue-50 hover:text-blue-600 transition-all'}
            icon={<ExportOutlined />}
            type={'text'}
            onClick={() => handleViewOrderDetails(r.id)}
          />
          {r.paymentStatus === 'PAID' ? (
            <Button
              className={
                '!bg-green-500 !border-green-500 hover:!bg-green-600 hover:!border-green-600'
              }
              loading={updatingOrderId === r.id}
              type={'primary'}
              onClick={() => handleMarkCompleted(r.id)}
            >
              {updatingOrderId === r.id ? 'Updating...' : 'Mark Completed'}
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
              <h2 className={'ado-cardcontent'}>{stats.totalOrders}</h2>
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
              <h2 className={'ado-cardcontent'}>{stats.totalUnits}</h2>
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
              <h2 className={'ado-cardcontent'}>${stats.totalAmount.toLocaleString()}</h2>
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
          current: currentPage,
          pageSize: 10,
          total: totalCount,
          onChange: (page) => dispatch(setPage(page))
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
