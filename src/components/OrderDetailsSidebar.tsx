'use client';

import React, { useMemo, useState, useEffect } from 'react';

import { Table, message, Image, Drawer, Button, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '@/store';
import { fetchOrderDetails, clearOrderDetails } from '@/store/slice/orders-slice';

import './order-details.css';

interface OrderDetailsSidebarProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

type OrderProductRow = {
  key: number;
  title: string;
  price: number;
  qty: number;
  image: string;
  colorName?: string;
  colorCode?: string;
  size?: string;
};

const OrderDetailsSidebar: React.FC<OrderDetailsSidebarProps> = ({ orderId, open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { orderDetails, orderLoading, orderError } = useSelector(
    (state: RootState) => state.orders
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [drawerWidth, setDrawerWidth] = useState('50%');

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 768) {
        setDrawerWidth('70%');
      } else if (window.innerWidth < 1024) {
        setDrawerWidth('75%');
      } else {
        setDrawerWidth('50%');
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (orderId && open) {
      dispatch(fetchOrderDetails(orderId));
    }

    return () => {
      dispatch(clearOrderDetails());
      setCurrentPage(1);
    };
  }, [dispatch, orderId, open]);

  useEffect(() => {
    if (orderError) {
      message.error(orderError);
    }
  }, [orderError]);

  const dataSource = useMemo(() => orderDetails?.items || [], [orderDetails]);

  const columns: TableColumnsType<OrderProductRow> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (value: string, record) => (
        <div className={'flex items-center gap-2'}>
          <Image
            alt={'product'}
            fallback={'/fallback.png'}
            height={32}
            src={record.image || '/fallback.png'}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            width={32}
          />
          <span className={'od-imagetext text-sm'}>{value ?? 'Untitled'}</span>
        </div>
      )
    },
    {
      title: 'Color',
      dataIndex: 'colorName',
      render: (_, record) => (
        <div className={'flex items-center gap-1'}>
          {record.colorCode ? (
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                backgroundColor: record.colorCode,
                borderRadius: 50,
                border: '1px solid #ccc'
              }}
            />
          ) : null}
          <span className={'text-sm'}>{record.colorName ?? '-'}</span>
        </div>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      render: (value: string) => <span className={'text-sm'}>{value ?? '-'}</span>
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (value: number) => (
        <span className={'od-price text-sm'}>
          ${value !== undefined && value !== null ? value.toFixed(2) : '0.00'}
        </span>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      render: (qty: number) => <span className={'od-quantity text-sm'}>{qty ?? 0}</span>
    }
  ];

  return (
    <Drawer
      closeIcon={null}
      open={open}
      placement={'right'}
      styles={{
        header: { borderBottom: '1px solid #f0f0f0', padding: '12px 16px' },
        body: { padding: '16px 16px' }
      }}
      title={
        <div className={'flex justify-between items-center w-full'}>
          <h4 className={'od-title !m-0 text-lg sm:text-xl'}>Order Details</h4>
          <Button
            className={'hover:bg-gray-100 rounded-lg'}
            icon={<CloseOutlined />}
            type={'text'}
            onClick={onClose}
          />
        </div>
      }
      width={drawerWidth}
      onClose={onClose}
    >
      {orderLoading ? (
        <div className={'flex items-center justify-center h-full'}>
          <Spin size={'large'} />
        </div>
      ) : orderDetails ? (
        <div className={'flex flex-col gap-4'}>
          <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'}>
            <div>
              <p className={'od-uppertitle text-xs sm:text-sm'}>Date</p>
              <p className={'od-lowertitle text-sm'}>{orderDetails.date}</p>
            </div>
            <div>
              <p className={'od-uppertitle text-xs sm:text-sm'}>Order #</p>
              <p className={'od-lowertitle text-sm'}>{orderDetails.orderNo}</p>
            </div>
            <div>
              <p className={'od-uppertitle text-xs sm:text-sm'}>User</p>
              <p className={'od-lowertitle text-sm'}>{orderDetails.user}</p>
            </div>
            <div>
              <p className={'od-uppertitle text-xs sm:text-sm'}>Products</p>
              <p className={'od-lowertitle text-sm'}>{dataSource.length}</p>
            </div>
            <div>
              <p className={'od-uppertitle text-xs sm:text-sm'}>Amount</p>
              <p className={'od-lowertitle text-sm'}>${orderDetails.total.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h5 className={'od-producttitle text-sm sm:text-base mb-2'}>Product Information</h5>
            <div className={'overflow-x-auto'}>
              <Table<OrderProductRow>
                bordered
                className={'od-tabledesign min-w-[600px]'}
                columns={columns}
                dataSource={dataSource}
                pagination={{
                  current: currentPage,
                  pageSize: 10,
                  total: dataSource.length,
                  onChange: (page) => setCurrentPage(page),
                  showSizeChanger: false
                }}
                rowClassName={() => 'h-12'}
                scroll={{ x: 600 }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={'flex items-center justify-center h-full'}>
          <p className={'text-gray-500'}>No order details available</p>
        </div>
      )}
    </Drawer>
  );
};

export default OrderDetailsSidebar;
