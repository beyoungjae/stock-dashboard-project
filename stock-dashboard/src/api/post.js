import axios from 'axios'

const api = axios.create({
   baseURL: `${process.env.REACT_APP_API_URL}/posts`,
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
})

// 게시글 작성
export const createPost = async (postData) => {
   try {
      const config = {
         headers: {
            'Content-Type': 'multipart/form-data', // 파일 업로드를 위한 헤더
         },
      }
      const response = await api.post('/', postData, config)
      return response.data
   } catch (error) {
      console.error('게시글 작성 오류:', error)
      throw error.response?.data?.error || '게시글 작성 중 오류가 발생했습니다.'
   }
}

// 게시글 목록 조회
export const getPosts = async () => {
   try {
      const response = await api.get('/')
      return response.data
   } catch (error) {
      console.error('게시글 목록 조회 오류:', error)
      throw error.response?.data?.error || '게시글 목록을 불러오는 중 오류가 발생했습니다.'
   }
}

// 인기 게시글 조회
export const getPopularPosts = async () => {
   try {
      const response = await api.get('/popular')
      return response.data
   } catch (error) {
      console.error('인기 게시글 조회 오류:', error)
      throw error.response?.data?.error || '인기 게시글을 불러오는 중 오류가 발생했습니다.'
   }
}

// 게시글 상세 조회
export const getPost = async (postId) => {
   try {
      const response = await api.get(`/${postId}`)
      return response.data
   } catch (error) {
      console.error('게시글 상세 조회 오류:', error)
      throw error.response?.data?.error || '게시글을 불러오는 중 오류가 발생했습니다.'
   }
}

// 게시글 수정
export const updatePost = async (postId, postData) => {
   try {
      const config = {
         headers: {
            'Content-Type': 'multipart/form-data', // 파일 업로드를 위한 헤더
         },
      }
      const response = await api.put(`/${postId}`, postData, config)
      return response.data
   } catch (error) {
      console.error('게시글 수정 오류:', error)
      throw error.response?.data?.error || '게시글 수정 중 오류가 발생했습니다.'
   }
}

// 게시글 삭제
export const deletePost = async (postId) => {
   try {
      await api.delete(`/${postId}`)
   } catch (error) {
      console.error('게시글 삭제 오류:', error)
      throw error.response?.data?.error || '게시글 삭제 중 오류가 발생했습니다.'
   }
}

// 게시글 좋아요
export const likePost = async (postId) => {
   try {
      const response = await api.post(`/${postId}/like`)
      return response.data
   } catch (error) {
      console.error('좋아요 오류:', error)
      throw error.response?.data?.error || '좋아요 처리 중 오류가 발생했습니다.'
   }
}

// 게시글 좋아요 취소
export const unlikePost = async (postId) => {
   try {
      const response = await api.delete(`/${postId}/like`)
      return response.data
   } catch (error) {
      console.error('좋아요 취소 오류:', error)
      throw error.response?.data?.error || '좋아요 취소 중 오류가 발생했습니다.'
   }
}
