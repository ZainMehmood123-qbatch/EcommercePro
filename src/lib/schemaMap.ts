// schemaMap.ts
import { getProductsSchema, productCreateSchema, productUpdateSchema, variantSchema } from '@/validations/productSchema';
import { signupSchema, resetpasswordSchema} from '@/validations/authSchema';
import { createOrderSchema, getOrdersSchema } from '@/validations/orderSchema';

export const validationMap = [
  { method: 'GET', path: '/api/products', schema: getProductsSchema },
  { method: 'POST', path: '/api/products', schema: productCreateSchema },
  { method: 'PUT', path: /^\/api\/products\/[^/]+$/, schema: productUpdateSchema },

  { method: 'POST', path: '/api/variants', schema: variantSchema },
  { method: 'PUT', path: /^\/api\/variants\/[^/]+$/, schema: variantSchema },

  { method: 'GET', path: '/api/orders', schema: getOrdersSchema},
  { method: 'POST', path: '/api/checkout', schema: createOrderSchema },
  
  { method: 'POST', path: '/api/signup', schema: signupSchema },
  { method: 'POST', path: '/api/reset-password', schema: resetpasswordSchema }
];
