import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import stockReducer from './slices/stockSlice'
import postReducer from './slices/postSlice'

const store = configureStore({
   reducer: {
      auth: authReducer,
      stock: stockReducer,
      post: postReducer,
   },
})

export default store
