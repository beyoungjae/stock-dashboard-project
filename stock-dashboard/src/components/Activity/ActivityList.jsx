import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

const ActivityList = () => {
   const { activity, activityFilter } = useSelector((state) => state.user)

   const formatDate = (dateString) => {
      if (!dateString) return '날짜 없음'

      try {
         return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: ko,
         })
      } catch (error) {
         console.error('날짜 형식 오류:', error)
         return '날짜 형식 오류'
      }
   }

   const filterActivities = (activities) => {
      if (!activityFilter) return activities

      const filterMap = {
         posts: 'POST_WRITE',
         comments: 'COMMENT_WRITE',
         likes: 'POST_LIKE',
      }

      return activities.filter((item) => item.type === filterMap[activityFilter])
   }

   if (!activity?.recentActivities?.length) {
      return (
         <EmptyContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyMessage>아직 활동 내역이 없습니다.</EmptyMessage>
         </EmptyContainer>
      )
   }

   const filteredActivities = filterActivities(activity.recentActivities)

   if (filteredActivities.length === 0) {
      return (
         <EmptyContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <EmptyIcon>🔍</EmptyIcon>
            <EmptyMessage>해당하는 활동 내역이 없습니다.</EmptyMessage>
         </EmptyContainer>
      )
   }

   return (
      <Container>
         {filteredActivities.map((item, index) => (
            <ActivityItem key={`${item.type}-${item.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
               <ActivityIcon>
                  {item.type === 'POST_WRITE' && '📝'}
                  {item.type === 'COMMENT_WRITE' && '💬'}
                  {item.type === 'POST_LIKE' && '❤️'}
               </ActivityIcon>
               <ActivityContent>
                  <ActivityTitle>
                     {item.type === 'POST_WRITE' && <Link to={`/post/${item.id}`}>{item.title || '삭제된 게시글'}</Link>}
                     {item.type === 'COMMENT_WRITE' && <Link to={`/post/${item.postId}`}>{item.postTitle || '삭제된 '}게시글에 댓글 작성</Link>}
                     {item.type === 'POST_LIKE' && <>{item.postTitle || '삭제된 '}게시글에 좋아요</>}
                  </ActivityTitle>
                  <ActivityTime>{formatDate(item.createdAt)}</ActivityTime>
               </ActivityContent>
            </ActivityItem>
         ))}
      </Container>
   )
}

const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const ActivityItem = styled(motion.div)`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
   padding: ${({ theme }) => theme.spacing.md};
   background: ${({ theme }) => theme.colors.background};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   transition: all 0.2s ease;

   &:hover {
      background: ${({ theme }) => theme.colors.backgroundHover};
   }
`

const ActivityIcon = styled.div`
   font-size: 1.5rem;
   min-width: 40px;
   height: 40px;
   display: flex;
   align-items: center;
   justify-content: center;
`

const ActivityContent = styled.div`
   flex: 1;
`

const ActivityTitle = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   margin-bottom: ${({ theme }) => theme.spacing.xs};

   a {
      color: ${({ theme }) => theme.colors.text};
      text-decoration: none;
      &:hover {
         color: ${({ theme }) => theme.colors.primary};
      }
   }
`

const ActivityTime = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const EmptyContainer = styled(motion.div)`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
`

const EmptyIcon = styled.div`
   font-size: 3rem;
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const EmptyMessage = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin: 0;
`

export default ActivityList
