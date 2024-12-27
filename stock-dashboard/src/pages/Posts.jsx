import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getPosts, selectAllPosts, selectPostLoading, selectPostError } from '../store/slices/postSlice'
import PostList from '../components/PostList'

const Posts = () => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const posts = useSelector(selectAllPosts)
   const loading = useSelector(selectPostLoading)
   const error = useSelector(selectPostError)
   const { user } = useSelector((state) => state.auth)

   useEffect(() => {
      dispatch(getPosts())
   }, [dispatch])

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         <Header>
            <Title>게시판</Title>
            {user && (
               <WriteButton onClick={() => navigate('/post/write')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  글쓰기
               </WriteButton>
            )}
         </Header>

         <PostList posts={posts} loading={loading.posts} error={error.posts} />
      </Container>
   )
}

const Container = styled(motion.div)`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Header = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
`

const WriteButton = styled(motion.button)`
   padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      opacity: 0.9;
   }
`

export default Posts
