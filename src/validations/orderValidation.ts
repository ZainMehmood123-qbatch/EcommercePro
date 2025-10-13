import Joi from 'joi';

export const orderItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  variantId: Joi.string().uuid().required(),
  qty: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required(),
  colorName: Joi.string().allow(null, ''),
  colorCode: Joi.string().allow(null, ''),
  size: Joi.string().allow(null, ''),
  image: Joi.string().uri().allow(null, ''), 
  title: Joi.string().allow(null, '') 
});

export const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  tax: Joi.number().min(0).optional(), 
  total: Joi.number().min(0).optional() 
});
