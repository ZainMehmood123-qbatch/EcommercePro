'use client';

import React from 'react';

import { Form } from 'antd';

export default function AuthForm({
  name,
  onFinish,
  children
}: {
  name: string;
  onFinish: (values: any) => void;
  children: React.ReactNode;
}) {
  return (
    <Form
      name={name}
      layout='vertical'
      validateTrigger="onBlur"
      onFinish={onFinish}
      autoComplete='off'
    >
      {children}
    </Form>
  );
}
