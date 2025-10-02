'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Table, Flex, Spin, message, Image } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '@/store';
import { fetchOrderDetails, clearOrderDetails } from '@/store/slice/orders-slice';
import { ProductType } from '@/types/product';

import './order-details.css';

const OrderDetails: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { orderDetails, orderLoading, orderError } = useSelector(
    (state: RootState) => state.orders
  );

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id as string));
    }
    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (orderError) {
      message.error(orderError);
    }
  }, [orderError]);

  const dataSource = useMemo(() => orderDetails?.items || [], [orderDetails]);

  const columns: TableColumnsType<ProductType> = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (value: string, record) => (
        <Flex align='center' gap='small'>
          <Image
            src={record.image}
            alt='product'
            width={24}
            height={24}
            style={{ objectFit: 'cover' }}
            preview={{ mask: <span>Preview</span> }}
            fallback='/fallback.png'
          />
          <span className='od-imagetext'>{value}</span>
        </Flex>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (value: number) => (
        <span className='od-price'>${value.toFixed(2)}</span>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (quantity: number) => (
        <span className='od-quantity'>{quantity}</span>
      )
    }
  ];

  if (orderLoading) {
    return (
      <div className='od-spinner'>
        <Spin size='large' tip='Loading order...' />
      </div>
    );
  }

  if (!orderDetails) {
    return <p className='od-orderNF'>Order not found</p>;
  }

  return (
    <Flex vertical gap='middle' className='od-whole'>
      <Flex align='center' gap='small' className='!pt-8'>
        <ArrowLeftOutlined onClick={() => router.back()} className='od-backarrow' />
        <h4 className='od-title'>Order Details</h4>
      </Flex>

      <div className='od-wholetable'>
        <div className='od-tablegrid'>
          <div>
            <p className='od-uppertitle'>Date</p>
            <p className='od-lowertitle'>{orderDetails.date}</p>
          </div>
          <div>
            <p className='od-uppertitle'>Order #</p>
            <p className='od-lowertitle'>{orderDetails.orderNo}</p>
          </div>
          <div>
            <p className='od-uppertitle'>User</p>
            <p className='od-lowertitle'>{orderDetails.user}</p>
          </div>
          <div>
            <p className='od-uppertitle'>Products</p>
            <p className='od-lowertitle'>{dataSource.length}</p>
          </div>
          <div>
            <p className='od-uppertitle'>Amount</p>
            <p className='od-lowertitle'>${orderDetails.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div>
        <h5 className='od-producttitle'>Product Information</h5>
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
          scroll={{ x: 1000 }}
          className='od-tabledesign'
        />
      </div>
    </Flex>
  );
};

export default OrderDetails;
