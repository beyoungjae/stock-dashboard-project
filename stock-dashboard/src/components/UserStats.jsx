import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const UserStats = () => {
   // Redux 상태에서 사용자 활동 데이터 가져오기
   const { activity } = useSelector((state) => state.user)

   // 통계 데이터
   const stats = [
      {
         id: 1,
         title: '게시글 작성 수',
         value: activity?.posts_count || 0,
         icon: '✍️',
         color: '#4CAF50',
      },
      {
         id: 2,
         title: '댓글 작성 수',
         value: activity?.comments_count || 0,
         icon: '💬',
         color: '#2196F3',
      },
      {
         id: 3,
         title: '좋아요 받은 횟수',
         value: activity?.likes_count || 0,
         icon: '❤️',
         color: '#F44336',
      },
   ]

   return (
      <Container>
         {stats.map((stat) => (
            <StatCard key={stat.id} whileHover={{ scale: 1.05 }} $color={stat.color}>
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
   background: ${({ $color }) => $color};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   color: white;
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
   box-shadow: ${({ theme }) => theme.shadows.medium};
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
