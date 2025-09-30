'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { Checkbox, Button } from 'antd';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';

import { LoginFormValues } from '@/types/auth';

import '../auth.css';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
  setLoading(true);

  const res = await signIn('credentials', {
    email: values.email,
    password: values.password,
    remember: values.remember ? 'true' : 'false',
    redirect: false
  });
  console.log('remember is = ',remember);

  if (res && res.error) {
    toast.error('Wrong username/password, please enter correct credentials');
    setLoading(false);
    return;
  }

  if (res && res.ok) {
    toast.success('Login successful! Redirecting...');

    // Fetch the session to get user role
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

  return (
    <div>
      <AuthTitle text='Login' />
      <AuthForm name='login' onFinish={onFinish}>
        <FormField label='Email Address' name='email' type='email' />
        <FormField label='Password' name='password' type='password' />
        <div className='mb-4'>
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            Remember me
          </Checkbox>
        </div>
        <Button htmlType='submit' loading={loading} className='auth-button'>
          Login
        </Button>
      </AuthForm>
      {/* <Button
        type='default'
        onClick={() => signIn('google')}
        className='!w-full !mt-3 !border-[#007BFF] !text-[#007BFF]'
      >
        Continue with Google
      </Button> */}

      <div className='auth-login-footer'>
        <Link href='/auth/forgot-password' className='auth-login-fptext'>
          Forgot Password? Reset
        </Link>
        <p className='auth-login-datext'>
          I dont have an account!{' '}
          <Link href='/auth/signup' className='auth-text'>
            SignUp
          </Link>
        </p>
      </div>
    </div>
  );
}
