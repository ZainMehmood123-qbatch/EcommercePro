'use client';
import React from 'react';

import { ProductBase } from './product';

export interface FetchedOrder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  id: string;
  fullname: string;
  createdAt: string;
  userId: string;
  items?: FetchedOrderProduct[];
  total?: number;
  paymentStatus?: string;
  totalOrders: number;
  totalUnits: number;
  totalAmount: number;
}

export interface FetchedOrderItem {
  productId: string;
  variantId: string;
  qty: number;
  price: number;
  colorName?: string;
  colorCode?: string;
  size?: string;
  image?: string;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  tax: number;
  total: number;
}

export interface FetchedOrderProduct {
  product: ProductBase;
  price: number;
  qty: number;
  colorName?: string;
  colorCode?: string;
  size?: string;
  image?: string;
}

export interface OrderType {
  key: React.Key;
  id: string;
  orderNo: string;
  date: string;
  user: string;
  products: number;
  amount: number;
  paymentStatus?: string;
}

export interface OrderDetailType {
  id: string;
  orderNo: string;
  date: string;
  user: string;
  total: number;
  items: {
    key: number;
    title: string;
    price: number;
    qty: number;
    image: string;
    colorName?: string;
    colorCode?: string;
    size?: string;
  }[];
}

export interface OrderItemInput {
  productId: string;
  variantId: string;
  title: string;
  qty: number;
  price: number;
  colorName?: string;
  colorCode?: string;
  size?: string;
  image?: string;
}
