'use client';

import { Form, Input } from 'antd';
import type { Rule, RuleObject } from 'antd/es/form';
import type { StoreValue } from 'rc-field-form/lib/interface';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'confirmPassword' | 'fullname' | 'mobile';
  dependency?: string;
  placeholder?: string;
}

const FormField = ({ label, name, type = 'text', dependency, placeholder }: FormFieldProps) => {
  const rules: Rule[] = [{ required: true, message: `Please enter your ${label.toLowerCase()}` }];

  switch (type) {
    case 'email':
      rules.push(
        { type: 'email', message: '' },
        {
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: 'Enter a valid email format (e.g. user@example.com)'
        }
      );
      break;

    case 'password':
      rules.push({
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        message:
          'Password must be at least 6 characters, include uppercase, lowercase, number, and special character'
      });
      break;

    case 'confirmPassword':
      if (dependency) {
        rules.push(({ getFieldValue }) => ({
          validator(_: RuleObject, value: StoreValue) {
            if (!value || getFieldValue(dependency) === value) {
              return Promise.resolve();
            }

            return Promise.reject(new Error('Passwords do not match!'));
          }
        }));
      }
      break;

    case 'fullname':
      rules.push(
        {
          pattern: /^(?=.*[A-Za-z].*[A-Za-z].*[A-Za-z])[A-Za-z ]+$/,
          message: 'Full name can only contain letters and spaces'
        },
        {
          min: 3,
          message: 'Full name must be at least 3 characters long'
        }
      );
      break;

    case 'mobile':
      rules.push({
        pattern: /^[0-9]{10,15}$/,
        message: 'Enter a valid mobile number (10-15 digits)'
      });
      break;
  }

  return (
    <Form.Item
      dependencies={dependency ? [dependency] : []}
      label={label}
      name={name}
      rules={rules}
    >
      {type.includes('password') ? (
        <Input.Password placeholder={placeholder || `Enter your ${label.toLowerCase()}`} />
      ) : (
        <Input
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          type={type === 'text' ? undefined : type}
        />
      )}
    </Form.Item>
  );
};

export default FormField;
