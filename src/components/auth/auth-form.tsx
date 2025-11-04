'use client';

import React from 'react';

import { Form } from 'antd';

const AuthForm = ({
  name,
  onFinish,
  children
}: {
  name: string;
  onFinish: (values: unknown) => void;
  children: React.ReactNode;
}) => (
  <Form
    autoComplete={'off'}
    layout={'vertical'}
    name={name}
    validateTrigger={'onBlur'}
    onFinish={onFinish}
  >
    {children}
  </Form>
);

export default AuthForm;
