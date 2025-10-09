'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Table, message, Image, Drawer, Button, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '@/store';
import { fetchOrderDetails, clearOrderDetails } from '@/store/slice/orders-slice';
import { ProductType } from '@/types/product';

import './order-details.css';

interface OrderDetailsSidebarProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

const OrderDetailsSidebar: React.FC<OrderDetailsSidebarProps> = ({ 
  orderId, 
  open, 
  onClose 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { orderDetails, orderLoading, orderError } = useSelector(
    (state: RootState) => state.orders
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [drawerWidth, setDrawerWidth] = useState('50%');

  // Adjust drawer width based on screen size
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

  const columns: TableColumnsType<any> = [
  {
    title: 'Title',
    dataIndex: 'title',
    render: (value: string, record) => (
      <div className='flex items-center gap-2'>
        <Image
          src={record.image || '/fallback.png'} // ✅ direct property now
          alt='product'
          width={32}
          height={32}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback='/fallback.png'
        />
        <span className='od-imagetext text-sm'>{value ?? 'Untitled'}</span>
      </div>
    )
  },
  {
    title: 'Color',
    dataIndex: 'colorName',
    render: (_, record) => (
      <div className='flex items-center gap-1'>
        {record.colorCode && (
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
        )}
        <span className='text-sm'>{record.colorName ?? '-'}</span>
      </div>
    )
  },
  {
    title: 'Size',
    dataIndex: 'size',
    render: (value: string) => <span className='text-sm'>{value ?? '-'}</span>
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (value: number) => (
      <span className='od-price text-sm'>
        ${value !== undefined && value !== null ? value.toFixed(2) : '0.00'}
      </span>
    )
  },
  {
    title: 'Quantity',
    dataIndex: 'qty',
    render: (qty: number) => <span className='od-quantity text-sm'>{qty ?? 0}</span>
  }
];

  return (
    <Drawer
      title={
        <div className='flex justify-between items-center w-full'>
          <h4 className='od-title !m-0 text-lg sm:text-xl'>Order Details</h4>
          <Button
            type='text'
            icon={<CloseOutlined />}
            onClick={onClose}
            className='hover:bg-gray-100 rounded-lg'
          />
        </div>
      }
      placement='right'
      width={drawerWidth}
      open={open}
      onClose={onClose}
      closeIcon={null}
      bodyStyle={{ padding: '16px 16px' }}
      headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '12px 16px' }}
    >
      {orderLoading ? (
        <div className='flex items-center justify-center h-full'>
          <Spin size='large' tip='Loading order...' />
        </div>
      ) : orderDetails ? (
        <div className='flex flex-col gap-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            <div>
              <p className='od-uppertitle text-xs sm:text-sm'>Date</p>
              <p className='od-lowertitle text-sm'>{orderDetails.date}</p>
            </div>
            <div>
              <p className='od-uppertitle text-xs sm:text-sm'>Order #</p>
              <p className='od-lowertitle text-sm'>{orderDetails.orderNo}</p>
            </div>
            <div>
              <p className='od-uppertitle text-xs sm:text-sm'>User</p>
              <p className='od-lowertitle text-sm'>{orderDetails.user}</p>
            </div>
            <div>
              <p className='od-uppertitle text-xs sm:text-sm'>Products</p>
              <p className='od-lowertitle text-sm'>{dataSource.length}</p>
            </div>
            <div>
              <p className='od-uppertitle text-xs sm:text-sm'>Amount</p>
              <p className='od-lowertitle text-sm'>${orderDetails.total.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h5 className='od-producttitle text-sm sm:text-base mb-2'>Product Information</h5>
            <div className='overflow-x-auto'>
              <Table<ProductType>
                columns={columns}
                dataSource={dataSource}
                pagination={{
                  current: currentPage,
                  pageSize: 10,
                  total: dataSource.length,
                  onChange: (page) => setCurrentPage(page),
                  showSizeChanger: false
                }}
                bordered
                rowClassName={() => 'h-12'}
                scroll={{ x: 600 }}
                className='od-tabledesign min-w-[600px]'
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center h-full'>
          <p className='text-gray-500'>No order details available</p>
        </div>
      )}
    </Drawer>
  );
};

export default OrderDetailsSidebar;
