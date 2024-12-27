import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { getPopularPosts, selectPopularPosts, selectPostLoading, selectPostError } from '../store/slices/postSlice'
import PostList from '../components/PostList'

const PopularPosts = () => {
   const dispatch = useDispatch()
   const posts = useSelector(selectPopularPosts)
   const loading = useSelector(selectPostLoading)
   const error = useSelector(selectPostError)

   useEffect(() => {
      dispatch(getPopularPosts())
   }, [dispatch])

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         <Header>
            <Title>인기 게시글</Title>
            <Subtitle>가장 많은 관심을 받은 게시글들입니다</Subtitle>
         </Header>

         <PostList posts={posts} loading={loading.popularPosts} error={error.popularPosts} />
      </Container>
   )
}

const Container = styled(motion.div)`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Header = styled.div`
   text-align: center;
   margin-bottom: ${({ theme }) => theme.spacing.xxl};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Subtitle = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin: 0;
`

export default PopularPosts
