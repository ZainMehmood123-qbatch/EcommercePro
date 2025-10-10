import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { FetchedOrder, OrderDetailType, FetchedOrderProduct } from '@/types/order';

// Fetch all orders
export const fetchOrders = createAsyncThunk<
  { orders: FetchedOrder[]; totalCount: number; page: number },
  { page: number; limit: number; search?: string },  
  { rejectValue: string }
>('orders/fetchOrders', async ({ page, limit, search }, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) {
      query.append('search', search); 
    }

    const res = await fetch(
      `http://localhost:3000/api/orders?${query.toString()}`,
      { credentials: 'include' }
    );

    console.log('response is =', res);

    if (!res.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await res.json();
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Something went wrong');
  }
});


// Fetch single order details
export const fetchOrderDetails = createAsyncThunk<
  OrderDetailType,
  string,
  { rejectValue: string }
>('orders/fetchOrderDetails', async (id, { rejectWithValue }) => {
  try {
    const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch order details');
    }

    const data = await res.json();

    const mappedOrder: OrderDetailType = {
      id: data.id,
      date: new Date(data.createdAt).toLocaleDateString(),
      orderNo: `ORD-${data.id.substring(0, 8)}`,
      user: data.user.fullname,
      total: data.total,
      items: data.items.map((item: FetchedOrderProduct, index: number) => ({
        key: index,
        title: item.product?.title ?? 'Untitled',
        price: item.price ?? 0,
        qty: item.qty ?? 0,
        image: item.image ?? '/fallback.png', 
        colorName: item.colorName ?? '-',
        colorCode: item.colorCode ?? '',
        size: item.size ?? '-'
      }))
    };

    return mappedOrder;
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Something went wrong');
  }
});

interface OrdersState {
  data: FetchedOrder[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  orderDetails: OrderDetailType | null;
  orderLoading: boolean;
  orderError: string | null;
}

const initialState: OrdersState = {
  data: [],
  totalCount: 0,
  loading: false,
  error: null,
  currentPage: 1,
  orderDetails: null,
  orderLoading: false,
  orderError: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.orderError = null;
      state.orderLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // orders list
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.orders;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })

      // single order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload || 'Something went wrong';
      });
  }
});

export const { setPage, clearOrderDetails } = ordersSlice.actions;
export default ordersSlice.reducer;
