'use client';

import { useEffect, useState } from 'react';

import {
  AppstoreOutlined,
  DollarOutlined,
  ExportOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Button, Card, Table, Tooltip } from 'antd';
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
    loading,
    statsLoading
  } = useSelector((state: RootState) => state.orders);

  const [, setInitialLoading] = useState(true);
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
    {
      title: 'Username',
      render: (_, r) => (r.user?.fullname ? r.user.fullname : 'Me')
    },
    {
      title: 'Email',
      render: (_, r) => (r.user?.email ? r.user.email : 'Me')
    },
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
          <Tooltip title={'View Order Details'}>
            <Button
              className={'hover:bg-blue-50 hover:text-blue-600 transition-all'}
              icon={<ExportOutlined />}
              type={'text'}
              onClick={() => handleViewOrderDetails(r.id)}
            />
          </Tooltip>
          {r.paymentStatus === 'PAID' ? (
            <Tooltip title={'Mark as Completed'}>
              <Button
                className={'hover:bg-green-50 transition-all'}
                icon={<CheckCircleOutlined className={'!text-green-600'} />}
                loading={updatingOrderId === r.id}
                type={'text'}
                onClick={() => handleMarkCompleted(r.id)}
              />
            </Tooltip>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <div className={'ado-whole'} style={{ position: 'relative' }}>
      <div className={'ado-uppergrid grid grid-cols-3 gap-4'}>
        {statsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={
                  'p-4 rounded-xl shadow-sm bg-white flex justify-between items-center animate-pulse transition-opacity duration-300'
                }
              >
                <div className={'space-y-2'}>
                  <div className={'h-4 w-24 bg-gray-200 rounded'} />
                  <div className={'h-6 w-16 bg-gray-300 rounded'} />
                </div>
                <div className={'h-8 w-8 bg-gray-200 rounded-full'} />
              </div>
            ))}
          </>
        ) : (
          <>
            <Card className={'p-1 transition-opacity duration-300'}>
              <div className={'ado-cards flex justify-between items-center'}>
                <div>
                  <p className={'ado-cardtitles'}>Total Orders:</p>
                  <h2 className={'ado-cardcontent'}>{stats.totalOrders}</h2>
                </div>
                <div className={'ado-cardicons text-xl text-gray-600'}>
                  <ShoppingCartOutlined />
                </div>
              </div>
            </Card>

            <Card className={'p-1 transition-opacity duration-300'}>
              <div className={'ado-cards flex justify-between items-center'}>
                <div>
                  <p className={'ado-cardtitles'}>Total Units:</p>
                  <h2 className={'ado-cardcontent'}>{stats.totalUnits}</h2>
                </div>
                <div className={'ado-cardicons text-xl text-gray-600'}>
                  <AppstoreOutlined />
                </div>
              </div>
            </Card>

            <Card className={'p-1 transition-opacity duration-300'}>
              <div className={'ado-cards flex justify-between items-center'}>
                <div>
                  <p className={'ado-cardtitles'}>Total Amount:</p>
                  <h2 className={'ado-cardcontent'}>${stats.totalAmount.toLocaleString()}</h2>
                </div>
                <div className={'ado-cardicons text-xl text-gray-600'}>
                  <DollarOutlined />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <div className={'ado-innernav'}>
        <h1 className={'ado-title'}>Orders</h1>
        <SearchComponent
          placeholder={'Search by Username OR OrderId'}
          searchTerm={localSearch}
          setSearchTerm={setLocalSearch}
        />
      </div>

      <Table
        className={'ado-wholetable'}
        columns={columns}
        dataSource={orders}
        loading={loading}
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
