import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createPost, addLike, createComment, getUserActivity } from '../../api/user'

// 포스트 작성 thunk
export const createPostThunk = createAsyncThunk('user/createPost', async ({ userId, postData }, { rejectWithValue }) => {
   try {
      const response = await createPost(userId, postData)
      return response
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '포스트 작성 실패')
   }
})

// 좋아요 추가 thunk
export const addLikeThunk = createAsyncThunk('user/addLike', async ({ userId, postId }, { rejectWithValue }) => {
   try {
      const response = await addLike(userId, postId)
      return response
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '좋아요 추가 실패')
   }
})

// 댓글 작성 thunk
export const createCommentThunk = createAsyncThunk('user/createComment', async ({ userId, commentData }, { rejectWithValue }) => {
   try {
      const response = await createComment(userId, commentData)
      return response
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '댓글 작성 실패')
   }
})

// 사용자 활동 조회 thunk
export const getUserActivityThunk = createAsyncThunk('user/getUserActivity', async (userId, { rejectWithValue }) => {
   try {
      const response = await getUserActivity(userId)
      if (!response) {
         throw new Error('데이터가 없습니다.')
      }

      // 데이터 구조 확인
      const activityData = {
         User: response.User,
         posts_count: response.posts_count,
         likes_count: response.likes_count,
         comments_count: response.comments_count,
         recentActivities: response.recentActivities || [],
      }

      return activityData
   } catch (error) {
      console.error('에러:', error)
      return rejectWithValue(error.message)
   }
})

const userSlice = createSlice({
   name: 'user',
   initialState: {
      activity: null,
      activityFilter: null,
      loading: false,
      error: null,
   },
   reducers: {
      setActivityFilter: (state, action) => {
         state.activityFilter = action.payload
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(getUserActivityThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getUserActivityThunk.fulfilled, (state, action) => {
            state.loading = false
            state.activity = action.payload
            state.error = null
         })
         .addCase(getUserActivityThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            state.activity = null
         })
   },
})

export const { setActivityFilter } = userSlice.actions
export default userSlice.reducer
