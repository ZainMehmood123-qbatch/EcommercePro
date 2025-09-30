// store/productsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductType, ProductResponse } from '@/types/product';

interface ProductsState {
  products: ProductType[];
  total: number;
  page: number;
  limit: number;
  search: string;
  sort: string;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  total: 0,
  page: 1,
  limit: 8,
  search: '',
  sort: 'newest',
  loading: false,
  loadingMore: false,
  hasMore: true,
  error: null
};

interface FetchProductsArgs {
  page: number;
  search: string;
  sort: string;
}

export const fetchProducts = createAsyncThunk<
  ProductResponse,
  FetchProductsArgs, 
  { rejectValue: string } 
>('products/fetchProducts', async ({ page, search, sort }, { rejectWithValue }) => {
  try {
    const res = await fetch(
      `/api/products?page=${page}&limit=8&search=${encodeURIComponent(
        search
      )}&sort=${sort}`
    );
    if (!res.ok) {
      return rejectWithValue('Failed to fetch products');
    }
    const data: ProductResponse = await res.json();
    return data;
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue('Something went wrong');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.products = [];
      state.page = 1;
      state.hasMore = true;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
    },
    nextPage: (state) => {
      state.page += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        if (state.page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { data, total } = action.payload;
        if (state.page === 1) {
          state.products = data;
        } else {
          state.products = [...state.products, ...data];
        }
        state.total = total;
        state.hasMore = state.page * state.limit < total;
        state.loading = false;
        state.loadingMore = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.payload ?? 'Unknown error';
        state.loading = false;
        state.loadingMore = false;
      });
  }
});

export const { resetProducts, setSearch, setSort, nextPage } =
  productsSlice.actions;

export default productsSlice.reducer;
