'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { signOut } from 'next-auth/react';
import { AppstoreOutlined, ShoppingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={'w-60 bg-white border-r border-[#E8E8EC] flex flex-col justify-between'}>
      <div>
        <div className={'p-5 font-inter text-base font-bold text-[#343A40]'}>E-commerce</div>
        <nav className={'flex flex-col'}>
          <div className={'flex flex-col'}>
            <Link
              className={`flex items-center gap-2 px-5 py-3 mt-3 font-semibold text-base font-inter mx-3 rounded-lg cursor-pointer
                ${
                  pathname.includes('/products')
                    ? 'bg-[#007BFF] text-white'
                    : 'text-[#1C2024] !bg-[#F7F6F680] hover:bg-gray-100'
                }`}
              href={'/admin/products'}
            >
              <AppstoreOutlined />
              Products
            </Link>

            <Link
              className={`flex items-center gap-2 px-5 py-3 mt-3 font-semibold text-base font-inter mx-3 rounded-lg cursor-pointer
                ${
                  pathname.includes('/admin/orders')
                    ? 'bg-[#007BFF] text-white'
                    : 'text-[#1C2024] !bg-[#F7F6F680] hover:bg-gray-100'
                }`}
              href={'/admin/orders'}
            >
              <ShoppingOutlined />
              Orders
            </Link>
          </div>
        </nav>
      </div>

      <Button
        className={
          '!text-red-500 !border !border-red-500 !rounded-lg !px-4 !mx-1 !py-5 !mb-1 !font-semibold !bg-red-100 transition-all !flex !items-center !gap-2 hover:!bg-red-50 hover:!text-red-600 '
        }
        onClick={() => signOut({ callbackUrl: '/auth/login' })}
      >
        <LogoutOutlined />
        Logout
      </Button>
    </aside>
  );
};

export default Sidebar;
