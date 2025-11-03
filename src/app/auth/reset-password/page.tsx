'use client';

import toast from 'react-hot-toast';
import { Button, Spin } from 'antd';

import { useSearchParams } from 'next/navigation';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { ResetPasswordFormValues } from '@/types/auth';

import '../auth.css';
import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(timer);
  }, []);
  const onFinish = async (values: ResetPasswordFormValues) => {
    try {
      setLoading(true);
      if (values.password !== values.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setTimeout(() => window.location.href = '/auth/login', 1500);
      } else {
        toast.error(data.error || 'Reset failed');
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong');
    }
    setLoading(false);
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]">
          <Spin size="large" />
        </div>
      )}
      <AuthTitle text='Reset Password' />
      <AuthForm name='resetPassword' onFinish={onFinish}>
        <FormField label='New Password' name='password' type='password' />
        <FormField
          label='Confirm Password'
          name='confirmPassword'
          type='confirmPassword'
          dependency='password'
        />
        <Button
          htmlType='submit'
          className='auth-button'
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>

      </AuthForm>
    </div>
  );
}
