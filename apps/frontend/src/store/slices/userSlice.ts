import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  total: 0,
};

export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string }) => {
    const response = await userService.getUsers(params);
    return response;
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await userService.createUser(userData);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: string; userData: Partial<User> }) => {
    const response = await userService.updateUser(id, userData);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: string) => {
    await userService.deleteUser(id);
    return id;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data.data;
        state.total = action.payload.data.pagination.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
