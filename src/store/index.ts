import ordersReducer from './slice/orders-slice';
import productsReducer from './slice/products-slice';

import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
     products: productsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
