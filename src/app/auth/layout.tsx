'use client';

import React from 'react';
import './auth.css';
export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='auth-layoutwhole'>
      <div className='auth-layout'>
        {children}
      </div>
    </div>
  );
}
