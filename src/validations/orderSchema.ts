import Joi from 'joi';

export const orderItemSchema = Joi.object({
  key: Joi.number().optional(),
  id: Joi.string().uuid().required(),
  variantId: Joi.string().uuid().required(),
  product: Joi.string().required(),
  image: Joi.string().allow('', null),
  colorName: Joi.string().allow('', null),
  colorCode: Joi.string().allow('', null),
  size: Joi.string().allow('', null),
  qty: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).optional()
});

export const getOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().allow('').optional().messages({
    'string.base': 'Search must be a string'
  })
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  tax: Joi.number().min(0).optional(),
  total: Joi.number().min(0).optional()
});
