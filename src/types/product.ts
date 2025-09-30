// /types/order.ts
'use client';
import React from 'react';

// product
export interface ProductBase {
  id: string;
  title: string;
  image: string;
  price: number;
  stock:number
}

export interface ProductAttributes {
  colorName?: string;
  colorCode?: string;
  size?: string;
}

export interface ProductType extends ProductBase, ProductAttributes {
  product?: ProductBase;
  key?: React.Key;
  qty?: number;
}

export interface ProductResponse {
  data: ProductType[];
  total: number;
}
