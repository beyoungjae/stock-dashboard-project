import React, { useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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

   // 게시글 삭제 함수
   const handleDelete = useCallback(async () => {
      if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
         try {
            await dispatch(deletePost(id)).unwrap()
            navigate('/posts')
         } catch (error) {
            console.error('게시글 삭제 실패:', error)
         }
      }
   }, [dispatch, navigate, id])

   // 좋아요 처리, 좋아요가 있는지 확인하고 좋아요 또는 좋아요 취소
   const handleLike = async () => {
      if (!user) {
         alert('좋아요를 누르려면 로그인이 필요합니다.')
         return
      }

      // 좋아요 처리 로직
      try {
         const isLiked = post.Likes?.some((like) => like.UserId === user.id)
         if (isLiked) {
            await dispatch(unlikePost(id)).unwrap()
         } else {
            await dispatch(likePost(id)).unwrap()
         }
      } catch (error) {
         console.error('좋아요 처리 실패:', error)
      }
   }

   // 게시글 로딩 중일 때 로딩 상태 표시
   if (loading.currentPost) {
      return (
         <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <LoadingMessage>게시글을 불러오는 중...</LoadingMessage>
         </LoadingContainer>
      )
   }

   // 게시글 로딩 실패 시 오류 메시지 표시
   if (error.currentPost) {
      return (
         <ErrorContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{error.currentPost}</ErrorMessage>
            <RetryButton onClick={() => dispatch(getPost(id))}>다시 시도</RetryButton>
         </ErrorContainer>
      )
   }

   if (!post) {
      return (
         <ErrorContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ErrorMessage>게시글을 찾을 수 없습니다.</ErrorMessage>
         </ErrorContainer>
      )
   }

   // 좋아요 상태 계산
   const isLiked = post.Likes?.some((like) => like.UserId === user?.id)

   return (
      <Container>
         <Article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Header>
               <Title>{post.title}</Title>
               <MetaInfo>
                  <Author>{post.User?.username}</Author>
                  <Separator>•</Separator>
                  <PostDate>
                     {/* 게시글 작성 일자 계산 */}
                     {post.createdAt
                        ? formatDistanceToNow(new Date(post.createdAt), {
                             addSuffix: true,
                             locale: ko,
                          })
                        : '방금 전'}
                  </PostDate>
               </MetaInfo>
            </Header>

            {post.img && (
               <ImageContainer>
                  <PostImage src={`${process.env.REACT_APP_API_URL}${post.img}`} alt={post.title} />
               </ImageContainer>
            )}

            <Content>{post.content}</Content>

            <Actions>
               <LikeButton onClick={handleLike} $isLiked={isLiked}>
                  <LikeIcon>{isLiked ? '❤️' : '🤍'}</LikeIcon>
                  <LikeCount>{post.Likes?.length || 0}</LikeCount>
               </LikeButton>

               {user?.id === post.UserId && (
                  <AuthorActions>
                     <EditButton as={Link} to={`/post/edit/${post.id}`}>
                        수정
                     </EditButton>
                     <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
                  </AuthorActions>
               )}
            </Actions>
         </Article>
         <CommentSection>
            <CommentList postId={id} comments={post.Comments} />
         </CommentSection>
      </Container>
   )
}

const Container = styled.div`
   max-width: 1000px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Article = styled(motion.article)`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.xl};
`

const Header = styled.header`
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0 0 ${({ theme }) => theme.spacing.md};
`

const MetaInfo = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
`

const Author = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.primary};
`

const Separator = styled.span`
   color: ${({ theme }) => theme.colors.textSecondary};
`

const PostDate = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const ImageContainer = styled.div`
   margin: ${({ theme }) => theme.spacing.xl} 0;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   overflow: hidden;
`

const PostImage = styled.img`
   width: 100%;
   height: auto;
   display: block;
`

const Content = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   line-height: 1.8;
   color: ${({ theme }) => theme.colors.text};
   white-space: pre-wrap;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Actions = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding-top: ${({ theme }) => theme.spacing.lg};
   border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const LikeButton = styled.button`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
   padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
   background: ${({ $isLiked, theme }) => ($isLiked ? `${theme.colors.error}15` : theme.colors.surfaceLight)};
   border: 1px solid ${({ $isLiked, theme }) => ($isLiked ? theme.colors.error : theme.colors.border)};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      transform: scale(1.05);
   }
`

const LikeIcon = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const LikeCount = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
`

const AuthorActions = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.md};
`

const ActionButton = styled.button`
   padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      opacity: 0.9;
   }
`

const EditButton = styled(ActionButton)`
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   text-decoration: none;
`

const DeleteButton = styled(ActionButton)`
   background: ${({ theme }) => theme.colors.error};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
`

const CommentSection = styled.div`
   margin-top: ${({ theme }) => theme.spacing.xl};
`

const LoadingContainer = styled(motion.div)`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${({ theme }) => theme.spacing.xxl};
`

const LoadingSpinner = styled(motion.div)`
   width: 40px;
   height: 40px;
   border: 3px solid ${({ theme }) => theme.colors.border};
   border-top-color: ${({ theme }) => theme.colors.primary};
   border-radius: 50%;
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const LoadingMessage = styled.div`
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const ErrorContainer = styled(motion.div)`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${({ theme }) => theme.spacing.xxl};
`

const ErrorIcon = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const ErrorMessage = styled.div`
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const RetryButton = styled.button`
   padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.surface};
   background: ${({ theme }) => theme.colors.primary};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      opacity: 0.9;
   }
`

export default PostDetail
