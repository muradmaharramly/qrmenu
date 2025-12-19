
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import menuReducer from '../features/menu/menuSlice'
import discountReducer from '../features/discount/discountSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    menu: menuReducer,
    discount: discountReducer,
  },
})