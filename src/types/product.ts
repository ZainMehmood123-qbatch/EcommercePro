'use client';
import React from 'react';

// Base product info (general info only)
export interface ProductBase {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

// Product variant (color, size, price, image, stock)
export interface ProductVariant {
  id: string;
  productId: string;
  colorName: string;
  colorCode: string;
  size: string;
  stock: number;
  price: number;
  image: string; 
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Complete product (with all its variants)
export interface ProductType extends ProductBase {
  variants: ProductVariant[];
  key?: React.Key;
  qty?: number; 
}

// Response format from backend (paginated or full list)
export interface ProductResponse {
  data: ProductType[];
  total: number;
}

export interface CreateProductInput {
  title: string;
  variants?: CreateProductVariantInput[];
}

export interface CreateProductVariantInput {
  colorName: string;
  colorCode: string;
  size: string;
  stock: number;
  price: number;
  image: string;
}