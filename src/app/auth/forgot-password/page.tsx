'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/store/index';
import { forgotPassword } from '@/store/slice/auth-slice';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { ForgotPasswordFormValues } from '@/types/auth';

import '../auth.css';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, successMessage } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);

    return () => clearTimeout(timer);
  }, []);

  // redirect after success
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => router.push('/auth/login'), 2000);
    }
  }, [successMessage, router]);

  const onFinish = async (values: ForgotPasswordFormValues) => {
    await dispatch(forgotPassword(values));
  };

  if (!mounted) {
    return (
      <div className={'fixed inset-0 flex items-center justify-center bg-white z-[9999]'}>
        <Spin size={'large'} />
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <div className={'fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]'}>
          <Spin size={'large'} />
        </div>
      ) : null}

      <AuthTitle text={'Forgot Password'} />
      <AuthForm name={'forgotPassword'} onFinish={onFinish}>
        <FormField label={'Email Address'} name={'email'} type={'email'} />
        <Button className={'auth-button'} htmlType={'submit'} loading={loading}>
          {loading ? 'Sending...' : 'Forgot Password'}
        </Button>
      </AuthForm>

      <p className={'auth-da'}>
        No, I remember my password{' '}
        <Link className={'auth-text'} href={'/auth/login'}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
