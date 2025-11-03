'use client';

import toast from 'react-hot-toast';
import { Button, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { SignupFormValues } from '@/types/auth';
import '../auth.css';
import { useState, useEffect } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // const onFinish = async (values: SignupFormValues) => {
  //   setLoading(true);

  //   if (values.password !== values.confirmPassword) {
  //     toast.error('Passwords do not match');
  //     setLoading(false);
  //     return;
  //   }

  //   const formattedValues = {
  //     ...values,
  //     email: values.email.toLowerCase().trim()
  //   };

  //   const { confirmPassword, ...payload } = formattedValues;
  //   console.log(confirmPassword);

  //   try {
  //     const res = await fetch('/api/auth/signup', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload)
  //     });
      
  //     if (!res) {
  //       toast.error('No response from server. Please try again.');
  //       return;
  //     }
      
  //     if (res.ok) {
  //       toast.success('Your account has been created successfully!');
  //       router.push('/auth/login');
  //     } else {
  //       const data = await res.json();
  //       toast.error(data.message || 'Signup failed');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error('Something went wrong. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onFinish = async (values: SignupFormValues) => {
    setLoading(true);

    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const formattedValues = {
      ...values,
      email: values.email.toLowerCase().trim()
    };

    const { confirmPassword, ...payload } = formattedValues;
    console.log(confirmPassword);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res) {
        toast.error('No response from server. Please try again.');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || data.message || 'Signup failed.');
        return;
      }
      toast.success(data.message || 'Your account has been created successfully!');
      router.push('/auth/login');
    } catch (err: unknown) {
      console.error('Signup error:', err);
      toast.error('Unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <AuthTitle text="SignUp" />
      <AuthForm name="signup" onFinish={onFinish}>
        <FormField label="Full Name" name="fullname" type="fullname" />
        <FormField label="Email Address" name="email" type="email" />
        <FormField label="Mobile Number" name="mobile" type="mobile" />
        <FormField label="Password" name="password" type="password" />
        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="confirmPassword"
          dependency="password"
        />
        <Button htmlType="submit" className="auth-button" loading={loading}>
          Sign Up
        </Button>
      </AuthForm>
      <p className="auth-da">
        Already have an account?{' '}
        <Link href="/auth/login" className="auth-text">
          Login
        </Link>
      </p>
    </div>
  );
}
