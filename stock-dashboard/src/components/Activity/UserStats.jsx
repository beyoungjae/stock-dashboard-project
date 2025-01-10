import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { setActivityFilter } from '../../store/slices/userSlice'

const UserStats = () => {
   const dispatch = useDispatch()
   const { activity } = useSelector((state) => state.user)
   const { activityFilter } = useSelector((state) => state.user)

   const stats = [
      {
         id: 'posts',
         title: '게시글 작성 수',
         value: activity?.posts_count || 0,
         icon: '✍️',
         color: '#4CAF50',
      },
      {
         id: 'comments',
         title: '댓글 작성 수',
         value: activity?.comments_count || 0,
         icon: '💬',
         color: '#2196F3',
      },
      {
         id: 'likes',
         title: '좋아요 누른 횟수',
         value: activity?.likes_count || 0,
         icon: '❤️',
         color: '#F44336',
      },
   ]

   const handleStatClick = (statId) => {
      dispatch(setActivityFilter(activityFilter === statId ? null : statId)) // 통계 필터 변경, 이미 선택된 필터라면 해제
   }

   return (
      <Container>
         {stats.map((stat) => (
            <StatCard key={stat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} $color={stat.color} $isActive={activityFilter === stat.id} onClick={() => handleStatClick(stat.id)}>
               <StatIcon>{stat.icon}</StatIcon>
               <StatContent>
                  <StatTitle>{stat.title}</StatTitle>
                  <StatValue>{stat.value}</StatValue>
               </StatContent>
            </StatCard>
         ))}
      </Container>
   )
}

const Container = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.lg};
   flex-wrap: wrap;
`

const StatCard = styled(motion.div)`
   flex: 1;
   min-width: 200px;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ $color, $isActive }) => ($isActive ? `${$color}` : `${$color}80`)};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   color: white;
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
   box-shadow: ${({ theme }) => theme.shadows.medium};
   cursor: pointer;
   transition: all 0.2s ease;

   &:hover {
      transform: translateY(-2px);
   }
`

const StatIcon = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
`

const StatContent = styled.div`
   display: flex;
   flex-direction: column;
`

const StatTitle = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`

const StatValue = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`

export default UserStats
