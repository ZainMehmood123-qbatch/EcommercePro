import Joi from 'joi';
import type { ProductVariant, ProductType } from '@/types/product';

// variant schema — matches ProductVariant except `id` (optional on create)
export const variantSchema = Joi.object<ProductVariant>({
  id: Joi.string().optional(),
  productId: Joi.string().optional(),
  colorName: Joi.string().min(1).required(),
  colorCode: Joi.string().pattern(/^#([0-9A-Fa-f]{6})$/).required(),
  size: Joi.string().min(1).required(),
  stock: Joi.number().integer().min(0).required(),
  price: Joi.number().positive().required(),
  image: Joi.string()
  .pattern(/^(https?:\/\/|\/|[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp))/, 'valid image path')
  .required(),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional()
});

// product create schema
export const productCreateSchema = Joi.object<ProductType>({
  id: Joi.string().optional(),
  title: Joi.string().min(3).max(100).required(),
  variants: Joi.array().items(variantSchema).min(1).required(),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional()
});

// product update schema
export const productUpdateSchema = Joi.object<ProductType>({
  id: Joi.string().optional(),
  title: Joi.string().min(3).max(100).required(),
  variants: Joi.array().items(variantSchema).optional(),
  createdAt: Joi.string().optional(),
  updatedAt: Joi.string().optional()
});
