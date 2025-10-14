'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button, Dropdown } from 'antd';
import { Bell, ShoppingBag, User } from 'lucide-react';
import { subscribeCartChange, getCartItems } from '@/lib/cart';

const Navbar = ({ title = 'E-commerce' }) => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const userId = session?.user?.id;

  // Keep cart count synced with user cart
  useEffect(() => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    const updateCount = () => {
      const items = getCartItems(userId);
      setCartCount(items.length);
    };

    // Initial load
    updateCount();

    // Subscribe for realtime updates
    const unsubscribe = subscribeCartChange(updateCount);

    return () => unsubscribe();
  }, [userId]);

  const handleShoppingClick = () => {
    if (isLoggedIn) {
      router.push('/user/shopping-bag');
    } else {
      router.push('/auth/login');
    }
  };

  const items = [
    {
      key: 'orders',
      label: (
        <Link href='/user/orders'>
          <span className='text-[#007BFF]'>Orders</span>
        </Link>
      )
    },
    {
      key: 'logout',
      label: (
        <Link
          onClick={() => {
            if (userId) localStorage.removeItem(`cart-${userId}`);
            signOut({ callbackUrl: '/' });
          }}
          href='/'
        >
          <span className='text-red-500'>Logout</span>
        </Link>
      )
    }
  ];

  return (
    <nav className='bg-white pt-3 px-4 py-4 flex items-center justify-between'>
      <p className='font-inter font-bold text-base text-black m-0'>{title}</p>
      <div className='flex items-center gap-5 relative'>
        <div className='relative inline-block'>
          <ShoppingBag
            onClick={handleShoppingClick}
            className='h-4 w-4 text-[#007BFF] cursor-pointer'
          />
          {cartCount > 0 && (
            <span className='absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none'>
              {cartCount}
            </span>
          )}
        </div>
        <Bell className='h-4 w-4 text-[#007BFF]' />
        {!isLoggedIn ? (
          <Link href='/auth/login' className='text-[#007BFF] text-xs'>
            Login
          </Link>
        ) : (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type='text' className='flex items-center text-[#007BFF] text-xs'>
              <User className='h-4 w-4 mr-1 text-[#007BFF]' />
              <span>{session?.user?.name || 'Account'}</span>
            </Button>
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
