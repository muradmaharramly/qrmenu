import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

// Fetch active discounts
export const fetchDiscounts = createAsyncThunk(
  'discount/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add discount
export const addDiscount = createAsyncThunk(
  'discount/add',
  async (discount, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .insert([discount])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update discount
export const updateDiscount = createAsyncThunk(
  'discount/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete discount
export const deleteDiscount = createAsyncThunk(
  'discount/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const discountSlice = createSlice({
  name: 'discount',
  initialState: {
    discounts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.discounts = action.payload
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(addDiscount.fulfilled, (state, action) => {
        state.discounts.unshift(action.payload)
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        const index = state.discounts.findIndex(d => d.id === action.payload.id)
        if (index !== -1) {
          state.discounts[index] = action.payload
        }
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter(d => d.id !== action.payload)
      })
  },
})

export default discountSlice.reducer