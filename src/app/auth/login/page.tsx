'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { Checkbox, Button, Spin } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';

import { LoginFormValues } from '@/types/auth';

import '../auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    const res = await signIn('credentials', {
      email: values.email,
      password: values.password,
      remember: values.remember ? 'true' : 'false',
      redirect: false
    });

    if (res && res.error) {
      toast.error('Wrong Email/Password, please enter correct credentials');
      setLoading(false);
      return;
    }

    if (res && res.ok) {
      toast.success('Login successfully!');
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin/products');
      } else {
        router.push('/');
      }
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
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]">
          <Spin size="large" tip="Logging in..." />
        </div>
      )}

      <AuthTitle text="Login" />
      <AuthForm name="login" onFinish={onFinish}>
        <FormField label="Email Address" name="email" type="email" />
        <FormField label="Password" name="password" type="password" />
        <div className="mb-4">
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            Remember me
          </Checkbox>
        </div>
        <Button htmlType="submit" loading={loading} className="auth-button">
          Login
        </Button>
      </AuthForm>
      <Button
  onClick={() => signIn('google', { callbackUrl: '/' })}
  icon={<GoogleOutlined />}
  className="auth-button mt-2"
>
  Continue with Google
</Button>

      <div className="auth-login-footer">
        <p className="auth-login-datext">
          Forgot Password?
          <Link href="/auth/forgot-password" className="auth-login-fptext">
            Reset
          </Link>
        </p>
        <p className="auth-login-datext">
          I dont have an account!{' '}
          <Link href="/auth/signup" className="auth-text">
            SignUp
          </Link>
        </p>
      </div>
    </div>
  );
}
