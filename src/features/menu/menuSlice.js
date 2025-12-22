import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

// ============================================
// ASYNC THUNKS
// ============================================

// Fetch all menu items
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Fetch sets (quantity ilə)
export const fetchSets = createAsyncThunk(
  'menu/fetchSets',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('sets')
        .select(`
          *,
          set_items (
            id,
            quantity,
            menu_item_id,
            menu_items (*)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add menu item
export const addMenuItem = createAsyncThunk(
  'menu/addItem',
  async (item, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([item])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update menu item
export const updateMenuItem = createAsyncThunk(
  'menu/updateItem',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
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

// Delete menu item
export const deleteMenuItem = createAsyncThunk(
  'menu/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Add set (quantity ilə)
export const addSet = createAsyncThunk(
  'menu/addSet',
  async ({ set, items }, { rejectWithValue }) => {
    try {
      // 1. Set-i əlavə et
      const { data: setData, error: setError } = await supabase
        .from('sets')
        .insert([set])
        .select()
      
      if (setError) throw setError

      const setId = setData[0].id

      // 2. Set items əlavə et (quantity ilə)
      if (items && items.length > 0) {
        const setItems = items.map(item => ({
          set_id: setId,
          menu_item_id: item.id,
          quantity: item.quantity || 1
        }))

        const { error: itemsError } = await supabase
          .from('set_items')
          .insert(setItems)
        
        if (itemsError) throw itemsError
      }

      // 3. Tam məlumatı geri qaytar
      const { data: fullSet, error: fetchError } = await supabase
        .from('sets')
        .select(`
          *,
          set_items (
            id,
            quantity,
            menu_item_id,
            menu_items (*)
          )
        `)
        .eq('id', setId)
        .single()

      if (fetchError) throw fetchError
      return fullSet
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update set (quantity ilə)
export const updateSet = createAsyncThunk(
  'menu/updateSet',
  async ({ id, updates, items }, { rejectWithValue }) => {
    try {
      // 1. Set məlumatlarını yenilə
      const { error: setError } = await supabase
        .from('sets')
        .update(updates)
        .eq('id', id)
      
      if (setError) throw setError

      // 2. Əgər items göndərilibsə, set_items-ləri yenilə
      if (items && items.length > 0) {
        // Köhnə set_items-ləri sil
        const { error: deleteError } = await supabase
          .from('set_items')
          .delete()
          .eq('set_id', id)

        if (deleteError) throw deleteError

        // Yeni set_items əlavə et (quantity ilə)
        const setItems = items.map(item => ({
          set_id: id,
          menu_item_id: item.id,
          quantity: item.quantity || 1
        }))

        const { error: itemsError } = await supabase
          .from('set_items')
          .insert(setItems)

        if (itemsError) throw itemsError
      }

      // 3. Yenilənmiş məlumatı geri qaytar
      const { data: updatedSet, error: fetchError } = await supabase
        .from('sets')
        .select(`
          *,
          set_items (
            id,
            quantity,
            menu_item_id,
            menu_items (*)
          )
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      return updatedSet
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete set
export const deleteSet = createAsyncThunk(
  'menu/deleteSet',
  async (id, { rejectWithValue }) => {
    try {
      // Əvvəlcə şəkili sil (əgər varsa)
      const { data: set } = await supabase
        .from('sets')
        .select('image_url')
        .eq('id', id)
        .single()

      if (set?.image_url) {
        try {
          const imagePath = set.image_url.split('/').slice(-2).join('/')
          await supabase.storage
            .from('menu-images')
            .remove([imagePath])
        } catch (err) {
          console.warn('Şəkil silinərkən xəta:', err)
        }
      }

      // Set və set_items-ləri sil (CASCADE ilə avtomatik)
      const { error } = await supabase
        .from('sets')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ============================================
// SLICE
// ============================================

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    sets: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch sets
      .addCase(fetchSets.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSets.fulfilled, (state, action) => {
        state.loading = false
        state.sets = action.payload
      })
      .addCase(fetchSets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add item
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Update item
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete item
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.error = action.payload
      })
      // Add set
      .addCase(addSet.fulfilled, (state, action) => {
        state.sets.unshift(action.payload)
      })
      .addCase(addSet.rejected, (state, action) => {
        state.error = action.payload
      })
      // Update set
      .addCase(updateSet.fulfilled, (state, action) => {
        const index = state.sets.findIndex(set => set.id === action.payload.id)
        if (index !== -1) {
          state.sets[index] = action.payload
        }
      })
      .addCase(updateSet.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete set
      .addCase(deleteSet.fulfilled, (state, action) => {
        state.sets = state.sets.filter(set => set.id !== action.payload)
      })
      .addCase(deleteSet.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError } = menuSlice.actions
export default menuSlice.reducer