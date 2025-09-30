// /types/order.ts
'use client';
import React from 'react';
import { ProductType,ProductBase,ProductAttributes } from './product';


export interface FetchedOrder {
  id: string;
  createdAt: string;
  userId: string;
  items?: FetchedOrderItem[];
  total?: number;
}
export interface FetchedOrderItem {
  productId: string;
  qty: number;
  price: number;
}

export interface CreateOrderRequest {
  items: ProductType[];
  tax: number;
  total: number;
}

export interface FetchedOrderProduct {
  product: ProductBase;
  price: number;
  qty: number;
}

export interface OrderType {
  key: React.Key;
  id: string;
  orderNo: string;
  date: string;
  user: string;
  products: number;
  amount: number;
}

export interface OrderDetailType {
  id: string;
  orderNo: string;
  date: string;
  user: string;
  total:number;
  items: ProductType[];
}

export interface OrderItemInput extends ProductAttributes {
  productId: string; 
  title: string;
  qty: number;
  price: number;
}