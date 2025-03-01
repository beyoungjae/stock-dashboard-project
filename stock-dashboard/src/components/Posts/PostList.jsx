import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { deletePost, getPost } from '../../store/slices/postSlice'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useDispatch, useSelector } from 'react-redux'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

const POSTS_PER_PAGE = 5 // 페이지당 게시글 수

const PostList = ({ posts, loading, error }) => {
   const { id } = useParams()
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0, visible: false, postId: null })
   const { user } = useSelector((state) => state.auth)
   const [currentPage, setCurrentPage] = useState(1)

   // 전체 페이지 수 계산
   const totalPages = Math.ceil((posts?.length || 0) / POSTS_PER_PAGE)

   // 현재 페이지의 게시글만 필터링
   const currentPosts = posts?.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

   // 페이지 번호 배열 생성
   const getPageNumbers = () => {
      const pageNumbers = []
      const maxVisiblePages = 5 // 한 번에 보여줄 최대 페이지 번호 수

      if (totalPages <= maxVisiblePages) {
         // 전체 페이지가 maxVisiblePages 이하면 모든 페이지 번호 표시
         for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i)
         }
      } else {
         // 현재 페이지 주변의 페이지 번호들만 표시
         let startPage = Math.max(1, currentPage - 2)
         let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

         if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
         }

         if (startPage > 1) {
            pageNumbers.push(1)
            if (startPage > 2) pageNumbers.push('...')
         }

         for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
         }

         if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbers.push('...')
            pageNumbers.push(totalPages)
         }
      }

      return pageNumbers
   }

   const handleMouseMove = (e, postId) => {
      const titleRect = e.currentTarget.getBoundingClientRect() // PostTitle의 위치 정보 가져오기
      setPreviewPosition({
         x: titleRect.left, // PostTitle의 왼쪽 위치
         y: titleRect.bottom + 5, // PostTitle의 아래쪽 위치 + 약간의 여백
         visible: true,
         postId,
      })
   }

   const handleMouseLeave = () => {
      setPreviewPosition((prev) => ({ ...prev, visible: false }))
   }

   useEffect(() => {
      if (id) {
         dispatch(getPost(id))
      }
   }, [dispatch, id])

   const handleDelete = useCallback(
      async (postId) => {
         if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            try {
               await dispatch(deletePost(postId)).unwrap()
               navigate('/posts')
            } catch (error) {
               console.error('게시글 삭제 실패:', error)
            }
         }
      },
      [dispatch, navigate]
   )

   const handleEdit = useCallback(
      (postId) => {
         navigate(`/post/edit/${postId}`)
      },
      [navigate]
   )

   if (loading) {
      return (
         <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <LoadingMessage>게시글을 불러오는 중...</LoadingMessage>
         </LoadingContainer>
      )
   }

   if (error) {
      return (
         <ErrorContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
         </ErrorContainer>
      )
   }

   if (!posts || posts.length === 0) {
      return (
         <EmptyContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyMessage>아직 게시글이 없습니다.</EmptyMessage>
         </EmptyContainer>
      )
   }

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
         {currentPosts.map((post) => (
            <React.Fragment key={post.id}>
               <PostCard
                  key={post.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                     duration: 0.3,
                     delay: 0,
                     type: 'spring',
                     stiffness: 100,
                  }}
                  whileHover={{
                     scale: 1.02,
                     boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  }}
                  whileTap={{ scale: 0.98 }}
               >
                  <PostContent>
                     <PostTitle>
                        <TitleText to={`/post/${post.id}`} onMouseMove={(e) => handleMouseMove(e, post.id)} onMouseLeave={handleMouseLeave}>
                           {post.title}
                        </TitleText>
                     </PostTitle>
                     <PostMeta initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <AuthorContainer>
                           <AuthorAvatar>{post.User?.username[0].toUpperCase()}</AuthorAvatar>
                           <Author as={Link} to={`/dashboard/${post.UserId}`}>
                              {post.User?.username}
                           </Author>
                        </AuthorContainer>
                        <Separator>•</Separator>
                        <PostDate>
                           {formatDistanceToNow(new Date(post.createdAt), {
                              addSuffix: true,
                              locale: ko,
                           })}
                        </PostDate>
                     </PostMeta>
                     <PostStats>
                        <StatItem>
                           <StatIcon>❤️</StatIcon>
                           <StatValue>{post.Likes?.length || post.likeCount || 0}</StatValue>
                        </StatItem>
                        <StatItem>
                           <StatIcon>💬</StatIcon>
                           <StatValue>{post.Comments?.length || 0}</StatValue>
                        </StatItem>
                        {user?.id === post.UserId && (
                           <ActionButtons>
                              <ActionButton whileHover={{ scale: 1.1, color: '#4CAF50' }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(post.id)}>
                                 <EditIcon />
                              </ActionButton>
                              <ActionButton whileHover={{ scale: 1.1, color: '#F44336' }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(post.id)}>
                                 <DeleteIcon />
                              </ActionButton>
                           </ActionButtons>
                        )}
                     </PostStats>
                  </PostContent>
               </PostCard>
               <PostPreview
                  style={{
                     left: previewPosition.x,
                     top: previewPosition.y,
                     opacity: previewPosition.visible && previewPosition.postId === post.id ? 1 : 0,
                     visibility: previewPosition.visible && previewPosition.postId === post.id ? 'visible' : 'hidden',
                  }}
               >
                  {post.img && <PreviewImage src={`${process.env.REACT_APP_API_URL}${post.img}`} alt={post.title} />}
                  <PreviewContent>{post.content}</PreviewContent>
               </PostPreview>
            </React.Fragment>
         ))}
         <PaginationContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <PageButton onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
               <NavigateBeforeIcon />
            </PageButton>
            {getPageNumbers().map((pageNum, index) => (
               <PageNumber key={index} onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)} active={currentPage === pageNum} isNumber={typeof pageNum === 'number'} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  {pageNum}
               </PageNumber>
            ))}
            <PageButton onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
               <NavigateNextIcon />
            </PageButton>
         </PaginationContainer>
      </Container>
   )
}

const PostPreview = styled(motion.div)`
   position: fixed;
   width: 300px;
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.md};
   box-shadow: ${({ theme }) => theme.shadows.large};
   opacity: 0;
   visibility: hidden;
   transform-origin: center;
   transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
   z-index: 1000;
   pointer-events: none;
`

const PreviewImage = styled.img`
   width: 100%;
   height: 150px;
   object-fit: cover;
   border-radius: ${({ theme }) => theme.borderRadius.small};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const PreviewContent = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin: 0;
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   -webkit-line-clamp: 3;
   -webkit-box-orient: vertical;
`

const Container = styled(motion.div)`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const PostCard = styled(motion.div)`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.large};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
   overflow: hidden;
   border: 1px solid ${({ theme }) => theme.colors.border};
   backdrop-filter: blur(10px);
   transition: all 0.05s ease;
`

const PostContent = styled.div`
   padding: ${({ theme }) => theme.spacing.xl};
`

const TitleText = styled(Link)`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
   line-height: 1.4;
   transition: color 0.2s ease;
   text-decoration: none;
   &:hover {
      color: ${({ theme }) => theme.colors.primary};
   }
`

const AuthorContainer = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
`

const AuthorAvatar = styled.div`
   width: 28px;
   height: 28px;
   border-radius: 50%;
   background: ${({ theme }) => theme.colors.primary};
   color: white;
   display: flex;
   align-items: center;
   justify-content: center;
   font-weight: bold;
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
`

const ActionButtons = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   margin-left: auto;
`

const ActionButton = styled(motion.button)`
   background: none;
   border: none;
   cursor: pointer;
   padding: ${({ theme }) => theme.spacing.xs};
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   color: ${({ theme }) => theme.colors.textSecondary};
   transition: all 0.2s ease;

   &:hover {
      background: ${({ theme }) => theme.colors.surfaceHover};
   }
`

const PostTitle = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0 0 ${({ theme }) => theme.spacing.sm};
   overflow: hidden;
   text-overflow: ellipsis;
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;

   a {
      color: ${({ theme }) => theme.colors.text};
      text-decoration: none;
      &:hover {
         color: ${({ theme }) => theme.colors.primary};
      }
   }
`

const PostMeta = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Author = styled(motion.span)`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.primary};
   cursor: pointer;
   text-decoration: none;

   &:hover {
      text-decoration: underline;
   }
`

const Separator = styled.span`
   color: ${({ theme }) => theme.colors.textSecondary};
`

const PostDate = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const PostStats = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.md};
   margin-top: auto;
   padding-top: ${({ theme }) => theme.spacing.md};
   border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const StatItem = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
`

const StatIcon = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
`

const StatValue = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
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
`

const EmptyContainer = styled(motion.div)`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${({ theme }) => theme.spacing.xxl};
`

const EmptyIcon = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxxl};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EmptyMessage = styled.div`
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const PaginationContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   margin-top: ${({ theme }) => theme.spacing.xl};
   gap: ${({ theme }) => theme.spacing.sm};
`

const PageButton = styled(motion.button).attrs({
   active: undefined,
})`
   padding: ${({ theme }) => theme.spacing.sm};
   background: none;
   border: none;
   cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
   opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
   color: ${({ theme }) => theme.colors.text};
   display: flex;
   align-items: center;
   justify-content: center;

   &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.primary};
   }
`

const PageNumber = styled(motion.button).withConfig({
   shouldForwardProp: (prop) => !['active', 'isNumber'].includes(prop), // 'active'와 'isNumber' prop을 전달하지 않음
})`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   background: ${({ theme, active }) => (active ? theme.colors.primary : 'none')};
   color: ${({ theme, active }) => (active ? theme.colors.surface : theme.colors.text)};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.small};
   cursor: ${({ isNumber }) => (isNumber ? 'pointer' : 'default')};
   font-weight: ${({ active }) => (active ? 'bold' : 'normal')};

   &:hover {
      background: ${({ theme, active, isNumber }) => (!active && isNumber ? `${theme.colors.primary}22` : active ? theme.colors.primary : 'none')};
   }
`

export default PostList
