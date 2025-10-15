'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Spin } from 'antd';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState, AppDispatch } from '@/store';
import { fetchOrders, setPage } from '@/store/slice/orders-slice';
import { FetchedOrder } from '@/types/order';
import SearchComponent from '@/components/dashboard/search-bar';
import Navbar from '@/components/common/navbar';
import OrderDetailsSidebar from '@/components/OrderDetailsSidebar';

import './orders.css';

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: orders, totalCount, currentPage } = useSelector(
    (state: RootState) => state.orders
  );

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        await dispatch(
          fetchOrders({ page: currentPage, limit: 10, search: debouncedSearch })
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [dispatch, currentPage, debouncedSearch]);

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedOrderId(null);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (_: FetchedOrder, record: FetchedOrder) => (
        <span className='order-titlenames'>
          {new Date(record.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      title: 'Order #',
      dataIndex: 'orderNo',
      render: (_: FetchedOrder, record: FetchedOrder) => (
        <span className='order-titlenames'>ORD-{record.id.substring(0, 8)}</span>
      )
    },
    {
      title: 'Product(s)',
      dataIndex: 'products',
      render: (_: FetchedOrder, record: FetchedOrder) => (
        <span className='order-titlenames'>{record.items?.length ?? 0}</span>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (_: FetchedOrder, record: FetchedOrder) => (
        <span className='order-titlenames'>
          ${Number(record.total ?? 0).toFixed(2)}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      render: (text: string) => {
        const status = text?.toUpperCase();
        const color =
          status === 'PENDING'
            ? 'orange'
            : status === 'PAID'
              ? 'blue'
              : status === 'COMPLETED'
                ? 'green'
                : 'gray';

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
      render: (_: FetchedOrder, record: FetchedOrder) => (
        <Button
          type='text'
          icon={<ExportOutlined />}
          className='order-titlenames hover:bg-blue-50 hover:text-blue-600 transition-all'
          onClick={() => handleViewOrderDetails(record.id)}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className='loader'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className='order-whole'>
        <div className='flex justify-between'>
          <div className='order-navbar'>
            <Link href='/'>
              <ArrowLeftOutlined className='order-arrowleft' />
            </Link>
            <h4 className='order-title'>Orders</h4>
          </div>

          <div className='mt-10 pr-4'>
            <SearchComponent
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder='Search by Order ID'
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey='id'
          pagination={{
            current: currentPage,
            pageSize: 10,
            total: totalCount,
            onChange: (page) => dispatch(setPage(page)),
            showSizeChanger: false,
            showTotal: (total) => (
              <span className='order-count'>{total} Total Count</span>
            )
          }}
          bordered
          scroll={{ x: 1000 }}
          rowClassName={() => 'h-12'}
          className='order-wholetable'
        />

        <OrderDetailsSidebar
          orderId={selectedOrderId}
          open={sidebarOpen}
          onClose={handleCloseSidebar}
        />
      </div>
    </>
  );
};

export default Orders;