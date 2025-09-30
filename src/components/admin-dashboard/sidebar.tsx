'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

import {
  AppstoreOutlined,
  ShoppingOutlined,
  LogoutOutlined
} from '@ant-design/icons';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='w-60 bg-white border-r border-[#E8E8EC] flex flex-col justify-between'>
      <div>
        <div className='p-5 font-inter text-base font-bold text-[#343A40]'>E-commerce</div>
        <nav className='flex flex-col'>
          <div className='flex flex-col'>
            <Link
              href='/admin/products'
              className={`flex items-center gap-2 px-5 py-3 mt-3 font-semibold text-base font-inter mx-3 rounded-lg cursor-pointer
      ${
        pathname.includes('/products')
          ? 'bg-[#007BFF] text-white'
          : 'text-[#1C2024] !bg-[#F7F6F680] hover:bg-gray-100'
      }`}
            >
              <AppstoreOutlined />
              Products
            </Link>

            <Link
              href='/admin/orders'
              className={`flex items-center gap-2 px-5 py-3 mt-3 font-semibold text-base font-inter mx-3 rounded-lg cursor-pointer
      ${
        pathname.includes('/admin/orders')
          ? 'bg-[#007BFF] text-white'
          : 'text-[#1C2024] !bg-[#F7F6F680] hover:bg-gray-100'
      }`}
            >
              <ShoppingOutlined />
              Orders
            </Link>
          </div>
        </nav>
      </div>

      {/* Logout button */}
      <button
        onClick={() => signOut({ callbackUrl: '/auth/login' })}
        className='!flex !items-center !gap-2 !px-6 !py-3 !text-[#EF1014] hover:!bg-gray-100 !font-semibold'
      >
        <LogoutOutlined />
        Logout
      </button>
    </aside>
  );
}
