// schemaMap.ts
import { getProductsSchema, productCreateSchema, productUpdateSchema, variantSchema } from '@/validations/productSchema';
import { createOrderSchema } from '@/validations/orderSchema';

export const validationMap = [
  { method: 'GET', path: '/api/products', schema: getProductsSchema },
  { method: 'POST', path: '/api/products', schema: productCreateSchema },
  { method: 'PUT', path: /^\/api\/products\/[^/]+$/, schema: productUpdateSchema },
  { method: 'POST', path: '/api/variants', schema: variantSchema },
  { method: 'PUT', path: /^\/api\/variants\/[^/]+$/, schema: variantSchema },
  { method: 'POST', path: '/api/checkout', schema: createOrderSchema }
];
