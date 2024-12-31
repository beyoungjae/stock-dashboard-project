import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import stockReducer from './slices/stockSlice'
import postReducer from './slices/postSlice'
import userReducer from './slices/userSlice'

const store = configureStore({
   reducer: {
      auth: authReducer,
      stock: stockReducer,
      post: postReducer,
      user: userReducer,
   },
})

export default store
