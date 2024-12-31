import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as postAPI from '../../api/post'

// 게시글 작성
export const createPost = createAsyncThunk('post/create', async (postData, { rejectWithValue }) => {
   try {
      const response = await postAPI.createPost(postData)
      return response.post
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 게시글 목록 조회
export const getPosts = createAsyncThunk('post/getPosts', async (_, { rejectWithValue }) => {
   try {
      const response = await postAPI.getPosts()
      return response
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 인기 게시글 조회
export const getPopularPosts = createAsyncThunk('post/getPopularPosts', async (_, { rejectWithValue }) => {
   try {
      const response = await postAPI.getPopularPosts()
      return response
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 게시글 상세 조회
export const getPost = createAsyncThunk('post/getPost', async (postId, { rejectWithValue }) => {
   try {
      const response = await postAPI.getPost(postId)
      return response
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 게시글 수정
export const updatePost = createAsyncThunk('post/update', async (data, { rejectWithValue }) => {
   try {
      const { id, ...postData } = data
      const response = await postAPI.updatePost(id, postData)
      return response
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 게시글 삭제
export const deletePost = createAsyncThunk('post/delete', async (postId, { rejectWithValue }) => {
   try {
      await postAPI.deletePost(postId)
      return postId
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 게시글 좋아요/취소
// export const toggleLike = createAsyncThunk('post/toggleLike', async ({ postId, liked }, { getState, rejectWithValue }) => {
//    try {
//       const state = getState()
//       const userId = state.auth.user.id // 현재 로그인한 사용자 ID

//       if (liked) {
//          // 좋아요 취소
//          await postAPI.unlikePost(postId)
//       } else {
//          // 좋아요 등록
//          await postAPI.likePost(postId)
//       }

//       // 좋아요 상태를 포함한 게시글 정보 반환
//       const response = await postAPI.getPost(postId)
//       return { postId, liked: !liked, likes: response.Likes, likeCount: response.Likes.length }
//    } catch (error) {
//       console.error('좋아요 토글 오류:', error)
//       return rejectWithValue(error.message)
//    }
// })

// 게시글 좋아요
export const likePost = createAsyncThunk('post/like', async (postId, { dispatch, rejectWithValue }) => {
   try {
      await postAPI.likePost(postId)
      dispatch(getPost(postId)) // 게시글 정보 다시 불러오기
      return postId
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

// 게시글 좋아요 취소
export const unlikePost = createAsyncThunk('post/unlike', async (postId, { dispatch, rejectWithValue }) => {
   try {
      await postAPI.unlikePost(postId)
      dispatch(getPost(postId)) // 게시글 정보 다시 불러오기
      return postId
   } catch (error) {
      return rejectWithValue(error.message)
   }
})

const initialState = {
   posts: [],
   popularPosts: [],
   currentPost: null,
   loading: {
      posts: false,
      popularPosts: false,
      currentPost: false,
      create: false,
      update: false,
      delete: false,
      like: false,
   },
   error: {
      posts: null,
      popularPosts: null,
      currentPost: null,
      create: null,
      update: null,
      delete: null,
      like: null,
   },
}

const postSlice = createSlice({
   name: 'post',
   initialState,
   reducers: {
      clearPosts: (state) => {
         state.posts = []
         state.error.posts = null
         state.loading.posts = false
      },
      clearCurrentPost: (state) => {
         state.currentPost = null
         state.error.currentPost = null
         state.loading.currentPost = false
      },
   },
   extraReducers: (builder) => {
      builder
         // 게시글 작성
         .addCase(createPost.pending, (state) => {
            state.loading.create = true
            state.error.create = null
         })
         .addCase(createPost.fulfilled, (state, action) => {
            state.loading.create = false
            state.posts.unshift(action.payload)
         })
         .addCase(createPost.rejected, (state, action) => {
            state.loading.create = false
            state.error.create = action.payload
         })

         // 게시글 목록 조회
         .addCase(getPosts.pending, (state) => {
            state.loading.posts = true
            state.error.posts = null
         })
         .addCase(getPosts.fulfilled, (state, action) => {
            state.loading.posts = false
            state.posts = action.payload
         })
         .addCase(getPosts.rejected, (state, action) => {
            state.loading.posts = false
            state.error.posts = action.payload
         })

         // 인기 게시글 조회
         .addCase(getPopularPosts.pending, (state) => {
            state.loading.popularPosts = true
            state.error.popularPosts = null
         })
         .addCase(getPopularPosts.fulfilled, (state, action) => {
            state.loading.popularPosts = false
            state.popularPosts = action.payload
         })
         .addCase(getPopularPosts.rejected, (state, action) => {
            state.loading.popularPosts = false
            state.error.popularPosts = action.payload
         })

         // 게시글 상세 조회
         .addCase(getPost.pending, (state) => {
            state.loading.currentPost = true
            state.error.currentPost = null
         })
         .addCase(getPost.fulfilled, (state, action) => {
            state.loading.currentPost = false
            state.currentPost = action.payload
         })
         .addCase(getPost.rejected, (state, action) => {
            state.loading.currentPost = false
            state.error.currentPost = action.payload
         })

         // 게시글 수정
         .addCase(updatePost.pending, (state) => {
            state.loading.update = true
            state.error.update = null
         })
         .addCase(updatePost.fulfilled, (state, action) => {
            state.loading.update = false
            state.currentPost = action.payload
            const index = state.posts.findIndex((post) => post.id === action.payload.id)
            if (index !== -1) {
               state.posts[index] = action.payload
            }
         })
         .addCase(updatePost.rejected, (state, action) => {
            state.loading.update = false
            state.error.update = action.payload
         })

         // 게시글 삭제
         .addCase(deletePost.pending, (state) => {
            state.loading.delete = true
            state.error.delete = null
         })
         .addCase(deletePost.fulfilled, (state, action) => {
            state.loading.delete = false
            state.posts = state.posts.filter((post) => post.id !== action.payload)
            state.currentPost = null
         })
         .addCase(deletePost.rejected, (state, action) => {
            state.loading.delete = false
            state.error.delete = action.payload
         })

         // 게시글 좋아요/취소
         // .addCase(toggleLike.pending, (state) => {
         //    state.loading.like = true
         //    state.error.like = null
         // })
         // .addCase(toggleLike.fulfilled, (state, action) => {
         //    const { postId, liked, likes, likeCount } = action.payload
         //    if (state.currentPost && state.currentPost.id === postId) {
         //       state.currentPost.liked = liked
         //       state.currentPost.Likes = likes
         //       state.currentPost.likeCount = likeCount
         //    }
         // })
         // .addCase(toggleLike.rejected, (state, action) => {
         //    state.loading.like = false
         //    state.error.like = action.payload
         // })

         // 게시글 좋아요
         .addCase(likePost.pending, (state) => {
            state.loading.like = true
            state.error.like = null
         })
         .addCase(likePost.fulfilled, (state, action) => {
            state.loading.like = false
            state.currentPost.Likes = [...(state.currentPost.Likes || []), action.payload]
         })
         .addCase(likePost.rejected, (state, action) => {
            state.loading.like = false
            state.error.like = action.payload
         })

         // 게시글 좋아요 취소
         .addCase(unlikePost.pending, (state) => {
            state.loading.like = true
            state.error.like = null
         })
         .addCase(unlikePost.fulfilled, (state, action) => {
            state.loading.like = false
            state.currentPost.Likes = state.currentPost.Likes.filter((like) => like !== action.payload)
         })
         .addCase(unlikePost.rejected, (state, action) => {
            state.loading.like = false
            state.error.like = action.payload
         })
   },
})

export const { clearPosts, clearCurrentPost } = postSlice.actions

// 선택자
export const selectAllPosts = (state) => state.post.posts
export const selectPopularPosts = (state) => state.post.popularPosts
export const selectCurrentPost = (state) => state.post.currentPost
export const selectPostLoading = (state) => state.post.loading
export const selectPostError = (state) => state.post.error

export default postSlice.reducer
