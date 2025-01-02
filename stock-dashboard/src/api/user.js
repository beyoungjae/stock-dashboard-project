import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL

const userApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
})

// 포스트 작성
export const createPost = async (userId, postData) => {
   try {
      const response = await userApi.post(`/user/${userId}/posts`, postData)
      return response.data
   } catch (error) {
      console.error('API Request 오류:', error)
      throw error
   }
}

// 좋아요 추가
export const addLike = async (userId, postId) => {
   try {
      const response = await userApi.post(`/user/${userId}/likes`, { postId })
      return response.data
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}

// 댓글 작성
export const createComment = async (userId, commentData) => {
   try {
      const response = await userApi.post(`/user/${userId}/comments`, commentData)
      return response.data
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}

// 사용자 활동 조회
export const getUserActivity = async (userId) => {
   try {
      const response = await userApi.get(`/user/${userId}/activity`)

      if (!response.data) {
         throw new Error('응답 데이터가 없습니다.')
      }

      // 응답 데이터 구조화
      const activityData = {
         User: response.data.User,
         posts_count: response.data.posts_count || 0,
         likes_count: response.data.likes_count || 0,
         comments_count: response.data.comments_count || 0,
         recentActivities: response.data.recentActivities || [],
      }

      return activityData
   } catch (error) {
      console.error('Activity API error:', error)
      throw error
   }
}
