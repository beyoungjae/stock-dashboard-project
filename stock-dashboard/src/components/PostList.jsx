import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const PostList = ({ posts, loading, error }) => {
   const navigate = useNavigate()

   if (loading) {
      return (
         <Container>
            <LoadingMessage>게시글을 불러오는 중...</LoadingMessage>
         </Container>
      )
   }

   if (error) {
      return (
         <Container>
            <ErrorMessage>{error}</ErrorMessage>
         </Container>
      )
   }

   if (!posts || posts.length === 0) {
      return (
         <Container>
            <EmptyMessage>게시글이 없습니다.</EmptyMessage>
         </Container>
      )
   }

   return (
      <Container>
         <ListContainer>
            {posts.map((post) => (
               <PostCard key={post.id} onClick={() => navigate(`/post/${post.id}`)} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                  <PostHeader>
                     <Title>{post.title}</Title>
                     <Author>{post.User.username}</Author>
                  </PostHeader>
                  <PostInfo>
                     <InfoItem>
                        <InfoIcon>👍</InfoIcon>
                        {post.Likes?.length || 0}
                     </InfoItem>
                     <InfoItem>
                        <InfoIcon>💬</InfoIcon>
                        {post.Comments?.length || 0}
                     </InfoItem>
                     <PostDate>
                        {formatDistanceToNow(new Date(post.createdAt), {
                           addSuffix: true,
                           locale: ko,
                        })}
                     </PostDate>
                  </PostInfo>
               </PostCard>
            ))}
         </ListContainer>
      </Container>
   )
}

const Container = styled.div`
   width: 100%;
   max-width: 800px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.lg};
`

const ListContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const PostCard = styled(motion.div)`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.lg};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
   }
`

const PostHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Title = styled.h3`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`

const Author = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const PostInfo = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const InfoItem = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`

const InfoIcon = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
`

const PostDate = styled.span`
   margin-left: auto;
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
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

const EmptyMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

export default PostList
