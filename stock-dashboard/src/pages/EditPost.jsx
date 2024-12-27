import React, { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getPost, selectCurrentPost, selectPostLoading, selectPostError } from '../store/slices/postSlice'
import PostForm from '../components/PostForm'

const EditPost = () => {
   const { id } = useParams()
   const dispatch = useDispatch()
   const post = useSelector(selectCurrentPost)
   const loading = useSelector(selectPostLoading)
   const error = useSelector(selectPostError)
   const { user } = useSelector((state) => state.auth)

   useEffect(() => {
      if (id) {
         dispatch(getPost(id))
      }
   }, [dispatch, id])

   if (!user) {
      return <Navigate to="/login" replace />
   }

   if (loading.currentPost) {
      return (
         <Container>
            <LoadingMessage>게시글을 불러오는 중...</LoadingMessage>
         </Container>
      )
   }

   if (error.currentPost) {
      return (
         <Container>
            <ErrorMessage>{error.currentPost}</ErrorMessage>
         </Container>
      )
   }

   if (!post) {
      return (
         <Container>
            <ErrorMessage>게시글을 찾을 수 없습니다.</ErrorMessage>
         </Container>
      )
   }

   if (post.UserId !== user.id) {
      return <Navigate to={`/post/${id}`} replace />
   }

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         <PostForm initialData={post} />
      </Container>
   )
}

const Container = styled(motion.div)`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const LoadingMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const ErrorMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

export default EditPost
