'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import toast from 'react-hot-toast';
import { Button, Spin } from 'antd';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { ForgotPasswordFormValues } from '@/types/auth';

import '../auth.css';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);

    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('If this email exists, a reset link was sent.');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        toast.error(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-white z-[9999]'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div>
      {loading ? (<div className='fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]'>
          <Spin size='large' />
        </div>
      ) : null}

      <AuthTitle text='Forgot Password' />
      <AuthForm name='forgotPassword' onFinish={onFinish}>
        <FormField label='Email Address' name='email' type='email' />
        <Button className="auth-button" disabled={loading} htmlType="submit" loading={loading}>
          {loading ? 'Sending...' : 'Forgot Password'}
        </Button>
      </AuthForm>

      <p className='auth-da'>
        No, I remember my password{' '}
        <Link className="auth-text" href="/auth/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
