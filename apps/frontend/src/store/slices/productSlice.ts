import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  total: 0,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: { page?: number; limit?: number; search?: string; category?: string }) => {
    const response = await productService.getProducts(params);
    return response;
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await productService.createProduct(productData);
    return response;
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, productData }: { id: string; productData: Partial<Product> }) => {
    const response = await productService.updateProduct(id, productData);
    return response;
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id: string) => {
    await productService.deleteProduct(id);
    return id;
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
