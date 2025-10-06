'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

import Image from 'next/image';

import { Card, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

import { addToCart } from '@/lib/cart';
import { CartItem } from '@/types/cart';
import toast from 'react-hot-toast';

interface DashboardCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  colorName?: string;
  colorCode?: string;
  size?: string;
  stock: number; 
}

export default function DashboardCard({
  id,
  title,
  price,
  image,
  colorName,
  colorCode,
  size,
  stock
}: DashboardCardProps) {
  const [quantity, setQuantity] = useState(1);

  const increase = () => {
    if (quantity < stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const { data: session } = useSession();

  const handleAddToCart = () => {
    if (!session?.user?.id) {
      toast.error('Please login first.');
      return;
    }

    const item: CartItem = {
      key: Date.now(),
      id,
      product: title,
      image,
      colorName,
      colorCode,
      size,
      qty: quantity,   
      price,
      stock
    };

    addToCart(session.user.id, item); 
  };
  return (
    <Card
      hoverable
      className='w-full h-auto rounded-[1px] border border-[#DFDFDF] flex flex-col justify-between'
      cover={
        <div className='flex justify-center items-center bg-white'>
          <Image
            src={image}
            alt={title}
            width={257}
            height={222}
            className='w-full object-cover pt-3 pl-3 pr-3'
          />
        </div>
      }
    >
      <h2 className='text-[#212529] text-sm font-medium leading-snug line-clamp-2 !mt-0'>
        {title}
      </h2>
      <p className='mt-2 font-inter text-xs sm:text-sm font-bold leading-[20px] text-[#868E96]'>
        Price:{' '}
        <span className='text-[#007BFF] font-normal text-xl leading-[30px]'>
          ${price.toFixed(2)}
        </span>
      </p>

      <div className='flex flex-col sm:flex-row items-center justify-between gap-[21px]'>
        <div className='flex items-center !rounded-sm gap-x-1'>
          <Button
            icon={<MinusOutlined />}
            onClick={decrease}
            disabled={quantity <= 1}
            className='border-none shadow-none h-9 w-9 !text-black !bg-white'
          />
          <span className='px-4 py-1 border border-[#DFDFDF] rounded-sm'>
            {quantity}
          </span>
          <Button
            icon={<PlusOutlined />}
            onClick={increase}
            disabled={quantity >= stock} 
            className='border-none shadow-none h-9 w-9'
          />
        </div>

        <Button
          type='primary'
          size='middle'
          onClick={handleAddToCart}
          disabled={stock === 0} 
          className='!font-inter !text-xs !xl:text-base !font-normal !leading-[24px] !flex !justify-center !items-center xl:!py-1.5 xl:!px-3'
        >
          {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Card>
  );
}
