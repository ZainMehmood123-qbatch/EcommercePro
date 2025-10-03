// /components/common/navbar/page.tsx
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

  useEffect(() => {
    if (session?.expires) {
      const expiryTime = new Date(session.expires).getTime();
      const now = Date.now();
      const timeout = expiryTime - now;

      if (timeout > 0) {
        const timer = setTimeout(() => {
          signOut({ callbackUrl: '/auth/login' });
        }, timeout);

        return () => clearTimeout(timer);
      }
    }
  }, [session]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCartCount(JSON.parse(stored).length);
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem('cart');
      setCartCount(updated ? JSON.parse(updated).length : 0);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const stored = getCartItems(userId);
    setCartCount(stored.length);

    const unsubscribe = subscribeCartChange(() => {
      setCartCount(getCartItems(userId).length);
    });

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
          className='!rounded-none !border-none !shadow-none'
          onClick={() => {
            localStorage.removeItem('cart');
            signOut({ callbackUrl: '/' });
          }}
          href={'/'}
        >
          <span className='text-red-500'>Logout</span>
        </Link>
      )
    }
  ];

  return (
    <nav className='bg-white pt-3 px-4 py-4 lg:pt-3 lg:px-6 xl:pt-3 xl:px-9 flex items-center justify-between'>
      <p className='font-inter font-bold text-base leading-4 text-black !m-0'>
        {title}
      </p>
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
          <Link
            href={'/auth/login'}
            className='text-[#007BFF] font-medium text-xs leading-3'
          >
            Login
          </Link>
        ) : (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              type='text'
              className='flex items-center text-[#007BFF] font-medium text-xs'
            >
              <User className='h-4 w-4 mr-1 text-[#007BFF]' />
              <span className='text-[#007BFF]'>
                {session?.user?.name || 'Account'}
              </span>
            </Button>
          </Dropdown>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
