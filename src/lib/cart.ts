// lib/cart.ts
import toast from 'react-hot-toast';
import { CartItem } from '@/types/cart';

type Listener = () => void;
const listeners: Listener[] = [];

function getCartKey(userId: string) {
  console.log(userId);
  return `cart-${userId}`;
}

export function subscribeCartChange(listener: Listener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

function notifyCartChange() {
  listeners.forEach((fn) => fn());
}

// Get cart items
export function getCartItems(userId: string): CartItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getCartKey(userId));
  return data ? (JSON.parse(data) as CartItem[]) : [];
}

// Add item to cart
export function addToCart(userId: string, item: CartItem) {
  const items = getCartItems(userId);

  const existingIndex = items.findIndex(
    (i) =>
      i.id === item.id &&
      i.colorName === item.colorName &&
      i.colorCode === item.colorCode &&
      i.size === item.size
  );

  if (existingIndex !== -1) {
    if (items[existingIndex].qty + item.qty <= items[existingIndex].stock) {
      items[existingIndex].qty += item.qty;
      toast.success('Quantity updated in cart!');
    } else {
      toast.error(`Only ${items[existingIndex].stock} items available in stock!`);
      return;
    }
  } else {
    if (item.qty <= item.stock) {
      items.push(item);
      toast.success('Item added to cart!');
    } else {
      toast.error(`Only ${item.stock} items available in stock!`);
      return;
    }
  }

  localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  notifyCartChange();
}

// Update entire cart
export function updateCart(userId: string, items: CartItem[]) {
  localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  notifyCartChange(); 
}
