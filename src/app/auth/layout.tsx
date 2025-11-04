'use client';

import React from 'react';
import './auth.css';

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={'auth-layoutwhole'}>
    <div className={'auth-layout'}>{children}</div>
  </div>
);

export default AuthLayout;
