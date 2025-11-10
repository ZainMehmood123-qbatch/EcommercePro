'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Checkbox, Button, Spin } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { LoginFormValues } from '@/types/auth';

import '../auth.css';

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);

    return () => clearTimeout(timer);
  }, []);

  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      const decoded = decodeURIComponent(errorParam);

      toast.error(decoded);
    }
  }, [errorParam]);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const email = values.email.trim().toLowerCase();
      const res = await signIn('credentials', {
        email,
        password: values.password,
        remember: remember ? 'true' : 'false',
        redirect: false
      });

      if (!res) {
        toast.error('No response from server. Please try again.');

        return;
      }

      if (res.error) {
        if (res.error.includes('CredentialsSignin')) {
          toast.error('Invalid email or password.');
        } else {
          toast.error(res.error || 'Something went wrong while logging in.');
        }

        return;
      }

      if (res.ok) {
        toast.success('Login successful!');
        try {
          const sessionRes = await fetch('/api/auth/session');

          if (!sessionRes.ok) {
            toast.error('Failed to fetch session. Please try again.');

            return;
          }

          const session = await sessionRes.json();

          if (session?.user?.role === 'ADMIN') {
            router.push('/admin/products');
          } else {
            router.push('/');
          }
        } catch (err) {
          toast.error('Unexpected error while fetching session.');
          // eslint-disable-next-line no-console
          console.error('Session fetch error:', err);
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
    } finally {
      setLoading(false);
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
    <div className={'relative'}>
      {loading ? (
        <div className={'fixed inset-0 flex items-center justify-center bg-white/60 z-[9999]'}>
          <Spin size={'large'} />
        </div>
      ) : null}

      <AuthTitle text={'Login'} />
      <AuthForm name={'login'} onFinish={onFinish}>
        <FormField label={'Email Address'} name={'email'} type={'email'} />
        <FormField label={'Password'} name={'password'} type={'password'} />
        <div className={'mb-4'}>
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            Remember me
          </Checkbox>
        </div>
        <Button className={'auth-button'} htmlType={'submit'} loading={loading}>
          Login
        </Button>
      </AuthForm>

      <Button
        className={'auth-button mt-2'}
        icon={<GoogleOutlined />}
        onClick={() => signIn('google')}
      >
        Continue with Google
      </Button>

      <div className={'auth-login-footer'}>
        <p className={'auth-login-datext'}>
          Forgot Password?{' '}
          <Link className={'auth-login-fptext'} href={'/auth/forgot-password'}>
            Reset
          </Link>
        </p>
        <p className={'auth-login-datext'}>
          I dont have an account!{' '}
          <Link className={'auth-text'} href={'/auth/signup'}>
            SignUp
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
