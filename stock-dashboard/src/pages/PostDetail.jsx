import React, { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getPost, deletePost, likePost, unlikePost, selectCurrentPost, selectPostLoading, selectPostError } from '../store/slices/postSlice'
import CommentList from '../components/CommentList'

const PostDetail = () => {
   const { id } = useParams()
   const navigate = useNavigate()
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

   const handleDelete = async () => {
      if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
         try {
            await dispatch(deletePost(id)).unwrap()
            navigate('/posts')
         } catch (error) {
            console.error('게시글 삭제 실패:', error)
         }
      }
   }

   const handleLike = useCallback(async () => {
      if (!user) {
         alert('로그인이 필요합니다.')
         return
      }

      try {
         await dispatch(likePost(id)).unwrap()
         dispatch(getPost(id)) // 게시글 정보 다시 불러오기
      } catch (error) {
         console.error('좋아요 등록 실패:', error)
      }
   }, [dispatch, id, user])

   const handleUnlike = useCallback(async () => {
      if (!user) {
         alert('로그인이 필요합니다.')
         return
      }

      try {
         await dispatch(unlikePost(id)).unwrap()
         dispatch(getPost(id)) // 게시글 정보 다시 불러오기
      } catch (error) {
         console.error('좋아요 취소 실패:', error)
      }
   }, [dispatch, id, user])

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

   const isLiked = post.Likes?.some((like) => like.UserId === user?.id)

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         <PostHeader>
            <Title>{post.title}</Title>
            <AuthorInfo>
               <Author>{post.User.username}</Author>
               <PostDate>
                  {formatDistanceToNow(new Date(post.createdAt), {
                     addSuffix: true,
                     locale: ko,
                  })}
               </PostDate>
            </AuthorInfo>
         </PostHeader>

         <Content>{post.content}</Content>

         <ActionBar>
            {isLiked ? (
               <UnlikeButton onClick={handleUnlike}>
                  <LikeIcon>👍</LikeIcon>
                  좋아요 취소 ({post.Likes?.length || 0})
               </UnlikeButton>
            ) : (
               <LikeButton onClick={handleLike}>
                  <LikeIcon>👍</LikeIcon>
                  좋아요 ({post.Likes?.length || 0})
               </LikeButton>
            )}

            {user && user.id === post.UserId && (
               <ButtonGroup>
                  <EditButton onClick={() => navigate(`/post/edit/${id}`)}>수정</EditButton>
                  <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
               </ButtonGroup>
            )}
         </ActionBar>

         <CommentSection>
            <SectionTitle>댓글</SectionTitle>
            <CommentList postId={id} comments={post.Comments} />
         </CommentSection>
      </Container>
   )
}

const Container = styled(motion.div)`
   max-width: 800px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const PostHeader = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const AuthorInfo = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const Author = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const PostDate = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const Content = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   line-height: 1.6;
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.xl};
   white-space: pre-wrap;
`

const ActionBar = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ButtonGroup = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.md};
`

const Button = styled.button`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};
   border: none;

   &:hover {
      opacity: 0.8;
   }
`

const LikeButton = styled(Button)`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
   background: none;
   color: ${({ theme }) => theme.colors.textSecondary};
   border: none;
   cursor: pointer;
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};

   &:hover {
      color: ${({ theme }) => theme.colors.primary};
   }
`

const UnlikeButton = styled(Button)`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
   background: none;
   color: ${({ theme }) => theme.colors.primary};
   border: none;
   cursor: pointer;
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};

   &:hover {
      color: ${({ theme }) => theme.colors.error};
   }
`

const LikeIcon = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   transition: transform 0.2s;
`

const EditButton = styled(Button)`
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
`

const DeleteButton = styled(Button)`
   background: ${({ theme }) => theme.colors.error};
   color: ${({ theme }) => theme.colors.surface};
`

const CommentSection = styled.div`
   margin-top: ${({ theme }) => theme.spacing.xl};
`

const SectionTitle = styled.h2`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
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

export default PostDetail
