import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return rejectWithValue(error.message)

    return data.user
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.user || null
  }
)

/* =======================
   SLICE
======================= */

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,        // initial session check
    authLoading: false,   // login/logout actions
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      state.loading = false
    },
    logoutUser(state) {
      state.user = null
      state.authLoading = false
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.error = null
        state.authLoading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.authLoading = false
        state.loading = false
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload
        state.authLoading = false
        state.loading = false
      })

      /* SESSION RESTORE */
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
  },
})

export const { setUser, logoutUser } = authSlice.actions
export default authSlice.reducer
