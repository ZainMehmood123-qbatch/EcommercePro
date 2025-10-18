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

export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  tax: Joi.number().min(0).optional(),
  total: Joi.number().min(0).optional()
});
