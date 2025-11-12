// /components/common/navbar/page.tsx
'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession, signOut } from 'next-auth/react';
import { Button, Dropdown } from 'antd';
import { ShoppingBag, User } from 'lucide-react';

import { toast } from 'react-hot-toast';

import { subscribeCartChange, getCartItems } from '@/lib/cart';
import NotificationBell from '@/components/common/Notification';

const Navbar = ({ title = 'E-commerce' }) => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setCartCount(0);

      return;
    }

    const updateCount = () => {
      const items = getCartItems(userId);

      setCartCount(items.length);
    };

    updateCount();

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
        <Link href={'/user/orders'}>
          <span className={'text-[#007BFF]'}>Orders</span>
        </Link>
      )
    },
    {
      key: 'logout',
      label: (
        // eslint-disable-next-line react/button-has-type
        <button
          className={
            'w-full text-left text-red-500 bg-transparent border-none px-2 py-1 hover:bg-gray-50'
          }
          onClick={async () => {
            await signOut({ redirect: false });
            toast.success('Successfully logged out!', { duration: 3000 });
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          }}
        >
          Logout
        </button>
      )
    }
  ];

  return (
    <nav
      className={
        'bg-white pt-3 px-4 py-4 lg:pt-3 lg:px-6 xl:pt-3 xl:px-9 flex items-center justify-between'
      }
    >
      <p className={'font-inter font-bold text-base leading-4 text-black !m-0'}>{title}</p>
      <div className={'flex items-center gap-5 relative'}>
        <div className={'relative inline-block'}>
          <ShoppingBag
            className={'h-4 w-4 text-[#007BFF] cursor-pointer'}
            onClick={handleShoppingClick}
          />
          {cartCount > 0 ? (
            <span
              className={
                'absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none'
              }
            >
              {cartCount}
            </span>
          ) : null}
        </div>
        <NotificationBell />
        {!isLoggedIn ? (
          <Link className={'text-[#007BFF] font-medium text-xs leading-3'} href={'/auth/login'}>
            Login
          </Link>
        ) : (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              className={
                'flex items-center text-[#007BFF] font-medium text-xs !border-none !shadow-none'
              }
              type={'text'}
            >
              <User className={'h-4 w-4 mr-1 text-[#007BFF]'} />
              <span className={'text-[#007BFF]'}>{session?.user?.name || 'Account'}</span>
            </Button>
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
