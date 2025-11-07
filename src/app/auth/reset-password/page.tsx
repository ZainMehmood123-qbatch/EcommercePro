'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useDispatch, useSelector } from 'react-redux';

import { Button, Spin } from 'antd';

import toast from 'react-hot-toast';

import { AppDispatch, RootState } from '@/store/index';
import { resetPassword } from '@/store/slice/auth-slice';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { ResetPasswordFormValues } from '@/types/auth';

import '../auth.css';

const ResetPasswordPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);

    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Invalid or missing token');

      return;
    }

    const result = await dispatch(
      resetPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword
      })
    );

    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    }
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

      <AuthTitle text={'Reset Password'} />

      <AuthForm name={'resetPassword'} onFinish={onFinish}>
        <FormField label={'New Password'} name={'password'} type={'password'} />
        <FormField
          dependency={'password'}
          label={'Confirm Password'}
          name={'confirmPassword'}
          type={'confirmPassword'}
        />
        <Button className={'auth-button'} disabled={loading} htmlType={'submit'}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </AuthForm>
    </div>
  );
};

export default ResetPasswordPage;
