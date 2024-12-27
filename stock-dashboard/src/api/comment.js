import axios from 'axios'

const api = axios.create({
   baseURL: `${process.env.REACT_APP_API_URL}/comment`,
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
})

// 댓글 작성
export const createComment = async (postId, content) => {
   try {
      const response = await api.post(`/${postId}`, { content })
      return response.data
   } catch (error) {
      console.error('댓글 작성 오류:', error)
      throw error.response?.data?.error || '댓글 작성 중 오류가 발생했습니다.'
   }
}

// 댓글 삭제
export const deleteComment = async (commentId) => {
   try {
      await api.delete(`/${commentId}`)
   } catch (error) {
      console.error('댓글 삭제 오류:', error)
      throw error.response?.data?.error || '댓글 삭제 중 오류가 발생했습니다.'
   }
}
