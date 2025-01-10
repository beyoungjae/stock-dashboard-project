import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import PostList from '../../components/Posts/PostList'
import { getPopularPosts } from '../../store/slices/postSlice'

const PopularPosts = () => {
   const dispatch = useDispatch()
   const { popularPosts, loading, error } = useSelector(
      // 인기 게시글 상태 선택
      (state) => ({
         popularPosts: state.post.popularPosts, // 인기 게시글 목록
         loading: state.post.loading.popularPosts, // 인기 게시글 로딩 상태
         error: state.post.error.popularPosts, // 인기 게시글 오류 상태
      }),
      (prev, next) => {
         return prev.popularPosts === next.popularPosts && prev.loading === next.loading && prev.error === next.error
      }
   )

   // 인기 게시글 목록 로드
   useEffect(() => {
      dispatch(getPopularPosts())
   }, [dispatch])

   return (
      <Container>
         <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Title>인기 게시글</Title>
            <Description>가장 많은 관심을 받은 게시글들을 모아봤습니다. 좋아요 수가 많은 인기있는 게시글들을 확인해보세요.</Description>
         </Header>

         <Content>
            <PostList posts={popularPosts} loading={loading} error={error} />
         </Content>
      </Container>
   )
}

const Container = styled.div`
   max-width: 1600px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Header = styled(motion.div)`
   margin-bottom: ${({ theme }) => theme.spacing.xxl};
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0 0 ${({ theme }) => theme.spacing.md};
   background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
`

const Description = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
   line-height: 1.6;
   margin: 0;
   max-width: 800px;
`

const Content = styled.div`
   margin-top: ${({ theme }) => theme.spacing.xl};
`

export default PopularPosts
