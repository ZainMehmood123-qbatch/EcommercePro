// import Joi from 'joi';
// import type { ProductVariant, ProductType } from '@/types/product';

// export const variantSchema = Joi.object<ProductVariant>({
//   id: Joi.string().optional(),
//   productId: Joi.string().optional(),
//   colorName: Joi.string().min(1).required(),
//   colorCode: Joi.string().pattern(/^#([0-9A-Fa-f]{6})$/).required(),
//   size: Joi.string().min(1).required(),
//   stock: Joi.number().integer().min(0).required(),
//   price: Joi.number().positive().required(),
//   isDeleted: Joi.boolean().optional(),
//   image: Joi.string()
//   .pattern(/^(https?:\/\/|\/|[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp))/, 'valid image path')
//   .required(),
//   createdAt: Joi.string().optional(),
//   updatedAt: Joi.string().optional()
// });

// export const productCreateSchema = Joi.object<ProductType>({
//   id: Joi.string().optional(),
//   title: Joi.string().min(3).max(100).required(),
//   variants: Joi.array().items(variantSchema).min(1).required(),
//   createdAt: Joi.string().optional(),
//   updatedAt: Joi.string().optional()
// });

// export const productUpdateSchema = Joi.object<ProductType>({
//   id: Joi.string().optional(),
//   title: Joi.string().min(3).max(100).required(),
//   variants: Joi.array().items(variantSchema).optional(),
//   createdAt: Joi.string().optional(),
//   updatedAt: Joi.string().optional()
// });



import Joi from 'joi';
import type { ProductVariant, ProductType } from '@/types/product';

export const variantSchema = Joi.object<ProductVariant>({
  id: Joi.string().optional(),
  productId: Joi.string().optional(),
  colorName: Joi.string().min(1).required().messages({
    'string.empty': 'Color name is required'
  }),
  colorCode: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{6})$/)
    .required()
    .messages({
      'string.empty': 'Color code is required',
      'string.pattern.base': 'Invalid color code format'
    }),
  size: Joi.string().min(1).required().messages({
    'string.empty': 'Size is required'
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.base': 'Stock must be a number',
    'number.min': 'Stock cannot be negative'
  }),
  price: Joi.number().positive().required().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than 0'
  }),
  isDeleted: Joi.boolean().optional(),
  image: Joi.string()
    .allow('', null) 
    .pattern(/^(https?:\/\/|\/|[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp))/, 'valid image path')
    .messages({
      'string.pattern.name': 'Please provide a valid image URL or path'
    }),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional()
});

export const productCreateSchema = Joi.object<ProductType>({
  id: Joi.string().optional(),
  title: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Product title is required',
    'string.min': 'Product title must be at least 3 characters',
    'string.max': 'Product title cannot exceed 100 characters'
  }),
  variants: Joi.array()
    .items(variantSchema)
    .default([])
    .messages({
      'array.base': 'Variants must be an array'
    }),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional()
});

export const productUpdateSchema = Joi.object<ProductType>({
  id: Joi.string().optional(),
  title: Joi.string().min(3).max(100).required(),
  variants: Joi.array()
    .items(variantSchema)
    .default([]) 
    .messages({
      'array.base': 'Variants must be an array'
    }),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional()
});
