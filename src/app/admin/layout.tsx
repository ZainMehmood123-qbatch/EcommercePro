'use client';

import React from 'react';

import Sidebar from '@/components/admin-dashboard/sidebar';
import Header from '@/components/admin-dashboard/header';
import './layout.css';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={'ad-layout-whole'}>
    <Sidebar />
    <div className={'ad-layout-first'}>
      <Header />
      <main className={'ad-layout-second'}>{children}</main>
    </div>
  </div>
);

export default DashboardLayout;
