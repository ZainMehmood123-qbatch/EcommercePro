import React from 'react';

// /types/cart.ts
export interface CartItem {
  key: React.Key;
  id: string; // productId
  variantId: string; // ProductVariant.id
  product: string;
  image: string;
  colorName?: string;
  colorCode?: string;
  size?: string;
  qty: number;
  price: number;
  stock: number;
  availableStock?: number; // frontend-only field
}
