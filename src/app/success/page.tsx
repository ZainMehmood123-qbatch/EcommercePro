'use client';

import Link from 'next/link';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Result } from 'antd';

const SuccessPage = () => {
  return (
    <div className={'flex justify-center items-center h-screen bg-gray-50'}>
      <Result
        extra={[
          <Link key={'orders'} href={'/user/orders'}>
            <Button type={'primary'}>View My Orders</Button>
          </Link>,
          <Link key={'home'} href={'/'}>
            <Button>Continue Shopping</Button>
          </Link>
        ]}
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        status={'success'}
        subTitle={'Thank you for your purchase. Your order has been placed successfully.'}
        title={'Payment Successful!'}
      />
    </div>
  );
};

export default SuccessPage;
