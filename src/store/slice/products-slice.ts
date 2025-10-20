import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ProductType, ProductResponse, ProductVariant } from '@/types/product';

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

// Fetch Products
export const fetchProducts = createAsyncThunk<ProductResponse, FetchProductsArgs, { rejectValue: string }>(
  'products/fetchProducts',
  async ({ page, search, sort }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products?page=${page}&limit=8&search=${encodeURIComponent(search)}&sort=${sort}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

// Create Product
export const createProduct = createAsyncThunk<ProductType, { title: string }, { rejectValue: string }>(
  'products/createProduct',
  async ({ title }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to create product');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

// Update Product
export const updateProduct = createAsyncThunk<ProductType, { id: string; title: string }, { rejectValue: string }>(
  'products/updateProduct',
  async ({ id, title }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to update product');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk<string, string, { rejectValue: string }>(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

// Create Variant
export const createVariant = createAsyncThunk<ProductVariant, { productId: string; variant: ProductVariant }, { rejectValue: string }>(
  'products/createVariant',
  async ({ productId, variant }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...variant, productId })
      });
      if (!res.ok) throw new Error('Failed to create variant');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

// Update Variant
export const updateVariant = createAsyncThunk<ProductVariant, ProductVariant, { rejectValue: string }>(
  'products/updateVariant',
  async (variant, { rejectWithValue }) => {
    try {
      if (!variant.id) throw new Error('Variant ID missing');
      const res = await fetch(`/api/variants/${variant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variant)
      });
      if (!res.ok) throw new Error('Failed to update variant');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

// Delete Variant
export const deleteVariant = createAsyncThunk<{ productId: string; variantId: string }, { productId: string; variantId: string }, { rejectValue: string }>(
  'products/deleteVariant',
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/variants/${variantId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete variant');
      return { productId, variantId };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
    }
  }
);

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

    builder.addCase(fetchProducts.pending, (state) => {
      if (state.page === 1) state.loading = true;
      else state.loadingMore = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      const { data, total } = action.payload;
      if (state.page === 1) state.products = data;
      else state.products.push(...data);
      state.total = total;
      state.hasMore = state.page * state.limit < total;
      state.loading = false;
      state.loadingMore = false;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.error = action.payload ?? 'Unknown error';
      state.loading = false;
      state.loadingMore = false;
    });

    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.products.push(action.payload);
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.products[index] = action.payload;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    });

    builder.addCase(createVariant.fulfilled, (state, action) => {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (product) product.variants.push(action.payload);
    });
    builder.addCase(updateVariant.fulfilled, (state, action) => {
      const product = state.products.find(p =>
        p.variants.some(v => v.id === action.payload.id)
      );
      if (product) {
        const idx = product.variants.findIndex(v => v.id === action.payload.id);
        if (idx !== -1) product.variants[idx] = action.payload;
      }
    });
    builder.addCase(deleteVariant.fulfilled, (state, action) => {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (product) {
        product.variants = product.variants.filter(v => v.id !== action.payload.variantId);
      }
    });
  }
});

export const { resetProducts, setSearch, setSort, nextPage } = productsSlice.actions;
export default productsSlice.reducer;

// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import type { ProductType, ProductResponse } from '@/types/product';

// interface ProductsState {
//   products: ProductType[];
//   total: number;
//   page: number;
//   limit: number;
//   search: string;
//   sort: string;
//   loading: boolean;
//   error: string | null;
//   pageWindow: number[];
//   pageCache: Record<number, ProductType[]>;
// }

// const initialState: ProductsState = {
//   products: [],
//   total: 0,
//   page: 1,
//   limit: 8,
//   search: '',
//   sort: 'newest',
//   loading: false,
//   error: null,
//   pageWindow: [],
//   pageCache: {}
// };

// export const fetchProducts = createAsyncThunk<
//   ProductResponse & { page: number; limit: number; fromCache?: boolean },
//   { page: number; search: string; sort: string; limit: number },
//   { state: { products: ProductsState }; rejectValue: string }
// >(
//   'products/fetchProducts',
//   async ({ page, search, sort, limit }, { getState, rejectWithValue }) => {
//     const state = getState().products;

//     if (state.pageCache[page]) {
//       return {
//         data: state.pageCache[page],
//         total: state.total,
//         page,
//         limit,
//         fromCache: true
//       };
//     }

//     try {
//       const res = await fetch(
//         `/api/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${sort}`
//       );
//       if (!res.ok) throw new Error('Failed to fetch products');
//       const data = await res.json();
//       return { ...data, page, limit, fromCache: false };
//     } catch (err) {
//       return rejectWithValue(err instanceof Error ? err.message : 'Something went wrong');
//     }
//   }
// );

// const MAX_PRODUCTS = 24;
// const REMOVE_COUNT = 8;

// const productsSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     setSearchAndSort: (state, action: PayloadAction<{ search: string; sort: string }>) => {
//       state.search = action.payload.search;
//       state.sort = action.payload.sort;
//       state.products = [];
//       state.pageWindow = [];
//       state.pageCache = {};
//       state.page = 1;
//       state.total = 0;
//     },
//     resetProducts: (state) => {
//       state.products = [];
//       state.page = 1;
//       state.pageWindow = [];
//       state.pageCache = {};
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         const { data, total, page, limit } = action.payload;
//         state.pageCache[page] = data;

//         if (!state.pageWindow.includes(page)) {
//           state.pageWindow.push(page);
//           state.pageWindow.sort((a, b) => a - b);
//         }

//         let combined = state.pageWindow.map((p) => state.pageCache[p]).flat();

//         if (combined.length > MAX_PRODUCTS) {
//           if (page > state.pageWindow[0]) {
//             const removedPages = state.pageWindow.slice(0, REMOVE_COUNT / limit);
//             removedPages.forEach((rp) => delete state.pageCache[rp]);
//             state.pageWindow = state.pageWindow.slice(removedPages.length);
//             combined = state.pageWindow.map((p) => state.pageCache[p]).flat();
//           } else {
//             const removedPages = state.pageWindow.slice(-REMOVE_COUNT / limit);
//             removedPages.forEach((rp) => delete state.pageCache[rp]);
//             state.pageWindow = state.pageWindow.slice(
//               0,
//               state.pageWindow.length - removedPages.length
//             );
//             combined = state.pageWindow.map((p) => state.pageCache[p]).flat();
//           }
//         }

//         state.products = combined;
//         state.total = total;
//         state.limit = limit;
//         state.loading = false;
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload ?? 'Unknown error';
//       });
//   }
// });

// export const { setSearchAndSort, resetProducts } = productsSlice.actions;
// export default productsSlice.reducer;
