import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import PostList from '../../components/Posts/PostList'
import { getPosts, selectAllPosts, selectPostLoading, selectPostError } from '../../store/slices/postSlice'

const Posts = () => {
   const dispatch = useDispatch()
   const posts = useSelector(selectAllPosts)
   const loading = useSelector(selectPostLoading)
   const error = useSelector(selectPostError)
   const { isAuthenticated } = useSelector((state) => state.auth)

   useEffect(() => {
      dispatch(getPosts())
   }, [dispatch])

   return (
      <Container>
         <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <HeaderContent>
               <Title>게시판</Title>
               <Description>주식 투자에 대한 의견을 나누고 토론하는 공간입니다. 다양한 투자 아이디어와 분석을 공유해보세요.</Description>
            </HeaderContent>
            {isAuthenticated && (
               <WriteButton as={Link} to="/post/write" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  글쓰기
               </WriteButton>
            )}
         </Header>

         <Content>
            <PostList posts={posts} loading={loading.posts} error={error.posts} />
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
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: ${({ theme }) => theme.spacing.xxl};
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const HeaderContent = styled.div`
   flex: 1;
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

const WriteButton = styled(motion.button)`
   padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
   color: ${({ theme }) => theme.colors.surface};
   background: ${({ theme }) => theme.colors.primary};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   text-decoration: none;
   transition: ${({ theme }) => theme.transitions.quick};
   margin-left: ${({ theme }) => theme.spacing.xl};

   &:hover {
      opacity: 0.9;
   }
`

const Content = styled.div`
   margin-top: ${({ theme }) => theme.spacing.xl};
`

export default Posts
