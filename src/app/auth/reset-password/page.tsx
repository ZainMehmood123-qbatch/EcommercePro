'use client';

import toast from 'react-hot-toast';
import { Button } from 'antd';

import { useSearchParams } from 'next/navigation';

import AuthTitle from '@/components/auth/auth-title';
import AuthForm from '@/components/auth/auth-form';
import FormField from '@/components/auth/fields/form-field';
import { ResetPasswordFormValues } from '@/types/auth';

import '../auth.css';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onFinish = async (values: ResetPasswordFormValues) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Reset failed');
      }
    } catch (err) {
      console.log(err);
      toast.error('Something went wrong');
    }
  };

  return (
    <div>
      <AuthTitle text='Reset Password' />
      <AuthForm name='resetPassword' onFinish={onFinish}>
        <FormField label='New Password' name='password' type='password' />
        <FormField
          label='Confirm Password'
          name='confirmPassword'
          type='confirmPassword'
          dependency='password'
        />
         <Button htmlType='submit' className='auth-button'>
          Reset Password
        </Button>
      </AuthForm>
    </div>
  );
}
