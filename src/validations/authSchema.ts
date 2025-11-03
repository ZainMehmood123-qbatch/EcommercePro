import Joi from 'joi';

import { SignupFormValues } from '@/types/auth';

export const signupSchema = Joi.object<SignupFormValues>({
  fullname: Joi.string().pattern(/^[a-zA-Z ]+$/).required().messages({
    'string.empty': 'Please enter your full name',
    'string.pattern.base': 'Full name can only contain letters and spaces'
  }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Please enter your email',
      'string.pattern.base':
        'Enter a valid email format (e.g. user@example.com)'
    }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Enter a valid mobile number (10-15 digits)'
    }),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .required()
    .messages({
      'string.empty': 'Please enter your password',
      'string.pattern.base':
        'Password must be at least 6 characters, include uppercase, lowercase, number, and special character'
    })
});

export const resetpasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    )
    .required()
    .messages({
      'string.pattern.base':
        'Password must be at least 6 characters, include uppercase, lowercase, number, and special character',
      'any.required': 'Password is required'
    })
});