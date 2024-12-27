import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { registerUser, loginUser, logoutUser, checkAuthStatus } from '../../api/auth'

// 회원가입 thunk
export const registerUserThunk = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
   try {
      const response = await registerUser(userData)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '회원가입 실패')
   }
})

// 로그인 thunk
export const loginUserThunk = createAsyncThunk('auth/loginUser', async (userData, { rejectWithValue }) => {
   try {
      const response = await loginUser(userData)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그인 실패')
   }
})

// 로그아웃 thunk
export const logoutUserThunk = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
   try {
      await logoutUser()
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그아웃 실패')
   }
})

// 로그인 상태 확인 thunk
export const checkAuthStatusThunk = createAsyncThunk('auth/checkAuthStatus', async (_, { rejectWithValue }) => {
   try {
      const response = await checkAuthStatus()
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '상태 확인 실패')
   }
})

const authSlice = createSlice({
   name: 'auth',
   initialState: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      // 회원가입
      builder
         .addCase(registerUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(registerUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(registerUserThunk.rejected, (state, action) => {
            state.loading = true
            state.error = action.payload
         })
      // 로그인
      builder
         .addCase(loginUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(loginUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
            state.isAuthenticated = true
         })
         .addCase(loginUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
      // 로그아웃
      builder
         .addCase(logoutUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(logoutUserThunk.fulfilled, (state) => {
            state.loading = false
            state.user = null
            state.isAuthenticated = false
         })
         .addCase(logoutUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
      // 로그인 상태 확인
      builder
         .addCase(checkAuthStatusThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload.user || null
            state.isAuthenticated = action.payload.isAuthenticated
         })
         .addCase(checkAuthStatusThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            state.isAuthenticated = false
            state.user = null
         })
   },
})

export default authSlice.reducer
