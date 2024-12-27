import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as postAPI from '../../api/post'

const postSlice = createSlice({
   name: 'post',
   initialState: {
      posts: [],
      loading: false,
      error: null,
   },
   reducers: {
      clearPosts: (state) => {
         state.posts = []
      },
   },
})

export const { clearPosts } = postSlice.actions
export default postSlice.reducer
