'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';
import { Button, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '@/store/index';
import { signupUser } from '@/store/slice/auth-slice';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { SignupFormValues } from '@/types/auth';

import '../auth.css';

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 400);

    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: SignupFormValues) => {
    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');

      return;
    }

    const formattedValues = {
      ...values,
      email: values.email.toLowerCase().trim()
    };

    const result = await dispatch(signupUser(formattedValues));

    if (signupUser.fulfilled.match(result)) {
      router.push('/auth/login');
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
      <AuthTitle text={'SignUp'} />
      <AuthForm name={'signup'} onFinish={onFinish}>
        <FormField label={'Full Name'} name={'fullname'} type={'fullname'} />
        <FormField label={'Email Address'} name={'email'} type={'email'} />
        <FormField label={'Mobile Number'} name={'mobile'} type={'mobile'} />
        <FormField label={'Password'} name={'password'} type={'password'} />
        <FormField
          dependency={'password'}
          label={'Confirm Password'}
          name={'confirmPassword'}
          type={'confirmPassword'}
        />
        <Button className={'auth-button'} htmlType={'submit'} loading={loading}>
          Sign Up
        </Button>
      </AuthForm>
      <p className={'auth-da'}>
        Already have an account?{' '}
        <Link className={'auth-text'} href={'/auth/login'}>
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
