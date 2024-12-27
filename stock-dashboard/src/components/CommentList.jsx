import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getPost } from '../store/slices/postSlice'
import * as commentAPI from '../api/comment'

const formatDate = (dateString) => {
   try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
         return '날짜 정보 없음'
      }
      return formatDistanceToNow(date, {
         addSuffix: true,
         locale: ko,
      })
   } catch (error) {
      console.error('날짜 형식 오류:', error)
      return '날짜 정보 없음'
   }
}

const CommentList = ({ postId, comments = [] }) => {
   const dispatch = useDispatch()
   const { user } = useSelector((state) => state.auth)
   const [newComment, setNewComment] = useState('')
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [error, setError] = useState(null)

   const handleSubmit = async (e) => {
      e.preventDefault()
      if (!newComment.trim() || isSubmitting) return

      setIsSubmitting(true)
      setError(null)

      try {
         await commentAPI.createComment(postId, newComment.trim())
         setNewComment('')
         dispatch(getPost(postId)) // 댓글이 추가된 게시글 정보를 다시 불러옵니다
      } catch (error) {
         setError(error.message || '댓글 작성 중 오류가 발생했습니다.')
      } finally {
         setIsSubmitting(false)
      }
   }

   const handleDelete = async (commentId) => {
      if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

      try {
         await commentAPI.deleteComment(commentId)
         dispatch(getPost(postId)) // 댓글이 삭제된 게시글 정보를 다시 불러옵니다
      } catch (error) {
         console.error('댓글 삭제 실패:', error)
         alert(error.message || '댓글 삭제 중 오류가 발생했습니다.')
      }
   }

   return (
      <Container>
         {user && (
            <CommentForm onSubmit={handleSubmit}>
               {error && <ErrorMessage>{error}</ErrorMessage>}
               <CommentInput value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글을 작성하세요..." disabled={isSubmitting} />
               <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '작성 중...' : '작성'}
               </SubmitButton>
            </CommentForm>
         )}

         <AnimatePresence>
            {comments.map((comment) => (
               <CommentItem key={comment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <CommentHeader>
                     <Author>{comment.User.username}</Author>
                     <CommentDate>{formatDate(comment.created_at)}</CommentDate>
                  </CommentHeader>
                  <CommentContent>{comment.content_text}</CommentContent>
                  {user && user.id === comment.User.id && <DeleteButton onClick={() => handleDelete(comment.id)}>삭제</DeleteButton>}
               </CommentItem>
            ))}
         </AnimatePresence>

         {comments.length === 0 && <EmptyMessage>아직 댓글이 없습니다.</EmptyMessage>}
      </Container>
   )
}

const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const CommentForm = styled.form`
   display: flex;
   gap: ${({ theme }) => theme.spacing.md};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CommentInput = styled.textarea`
   flex: 1;
   padding: ${({ theme }) => theme.spacing.md};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   resize: vertical;
   min-height: 80px;
   transition: ${({ theme }) => theme.transitions.quick};

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
   }
`

const SubmitButton = styled.button`
   padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};
   align-self: flex-start;

   &:hover {
      opacity: 0.9;
   }
`

const CommentItem = styled(motion.div)`
   position: relative;
   padding: ${({ theme }) => theme.spacing.lg};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const CommentHeader = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Author = styled.span`
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
`

const CommentDate = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const CommentContent = styled.p`
   color: ${({ theme }) => theme.colors.text};
   line-height: 1.5;
   margin: 0;
   white-space: pre-wrap;
`

const DeleteButton = styled.button`
   position: absolute;
   top: ${({ theme }) => theme.spacing.md};
   right: ${({ theme }) => theme.spacing.md};
   padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
   background: none;
   border: none;
   color: ${({ theme }) => theme.colors.error};
   cursor: pointer;
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   opacity: 0.7;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      opacity: 1;
   }
`

const EmptyMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
`

const ErrorMessage = styled.div`
   padding: ${({ theme }) => theme.spacing.sm};
   margin-bottom: ${({ theme }) => theme.spacing.md};
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`

export default CommentList
