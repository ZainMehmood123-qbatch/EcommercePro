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
//   loadingMore: boolean;
//   hasMore: boolean;
//   error: string | null;
// }

// const initialState: ProductsState = {
//   products: [],
//   total: 0,
//   page: 1,
//   limit: 8,
//   search: '',
//   sort: 'newest',
//   loading: false,
//   loadingMore: false,
//   hasMore: true,
//   error: null
// };

// interface FetchProductsArgs {
//   page: number;
//   search: string;
//   sort: string;
// }

// export const fetchProducts = createAsyncThunk<
//   ProductResponse,
//   FetchProductsArgs,
//   { rejectValue: string }
// >('products/fetchProducts', async ({ page, search, sort }, { rejectWithValue }) => {
//   try {
//     const res = await fetch(
//       `/api/products?page=${page}&limit=8&search=${encodeURIComponent(search)}&sort=${sort}`
//     );

//     if (!res.ok) {
//       return rejectWithValue('Failed to fetch products');
//     }

//     const data: ProductResponse = await res.json();
//     return data;
//   } catch (err) {
//     if (err instanceof Error) {
//       return rejectWithValue(err.message);
//     }
//     return rejectWithValue('Something went wrong');
//   }
// });

// const productsSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     resetProducts: (state) => {
//       state.products = [];
//       state.page = 1;
//       state.hasMore = true;
//     },
//     setSearch: (state, action: PayloadAction<string>) => {
//       state.search = action.payload;
//     },
//     setSort: (state, action: PayloadAction<string>) => {
//       state.sort = action.payload;
//     },
//     nextPage: (state) => {
//       state.page += 1;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         if (state.page === 1) state.loading = true;
//         else state.loadingMore = true;
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         const { data, total } = action.payload;
//         if (state.page === 1) {
//           state.products = data;
//         } else {
//           state.products = [...state.products, ...data];
//         }
//         state.total = total;
//         state.hasMore = state.page * state.limit < total;
//         state.loading = false;
//         state.loadingMore = false;
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.error = action.payload ?? 'Unknown error';
//         state.loading = false;
//         state.loadingMore = false;
//       });
//   }
// });

// export const { resetProducts, setSearch, setSort, nextPage } = productsSlice.actions;
// export default productsSlice.reducer;



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
