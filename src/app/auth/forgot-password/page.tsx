'use client';

import { Button,Spin } from 'antd';
import toast from 'react-hot-toast';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { ForgotPasswordFormValues } from '@/types/auth';

import '../auth.css';
import { useState,useEffect } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading,setLoading] = useState(false);
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
        body: JSON.stringify(values)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        router.push('/auth/login');
      } else {
        toast.error(data.error || 'Failed to send reset email');
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
        <Spin size="large" tip="Loading login form..." />
      </div>
    );
  }
  return (
    <div>
  {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]">
          <Spin size="large" tip="Logging in..." />
        </div>
      )}
      <AuthTitle text='Forgot Password' />
      <AuthForm name='forgotPassword' onFinish={onFinish}>
        <FormField label='Email Address' name='email' type='email' />
         <Button htmlType='submit' className='auth-button'>
          Forgot Password
        </Button>
      </AuthForm>
      <p className='auth-da'>
        No, I remember my password{' '}
        <Link href='/auth/login' className='auth-text'>
          Login
        </Link>
      </p>
    </div>
  );
}
