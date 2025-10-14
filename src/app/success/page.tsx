'use client';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className='flex justify-center items-center h-screen bg-gray-50'>
      <Result
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        status='success'
        title='Payment Successful!'
        subTitle='Thank you for your purchase. Your order has been placed successfully.'
        extra={[
          <Link key='orders' href='/user/orders'>
            <Button type='primary'>View My Orders</Button>
          </Link>,
          <Link key='home' href='/'>
            <Button>Continue Shopping</Button>
          </Link>
        ]}
      />
    </div>
  );
}
