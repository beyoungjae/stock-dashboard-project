import React from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const ActivityList = () => {
   // 임시 활동 데이터 (나중에 Redux로 대체)
   const activities = [
      {
         id: 1,
         type: 'STOCK_VIEW',
         symbol: 'AAPL',
         name: '애플',
         timestamp: new Date('2024-01-10T09:30:00'),
      },
      {
         id: 2,
         type: 'WATCHLIST_ADD',
         symbol: '005930.KS',
         name: '삼성전자',
         timestamp: new Date('2024-01-10T10:15:00'),
      },
      {
         id: 3,
         type: 'POST_WRITE',
         title: '애플 실적 분석',
         timestamp: new Date('2024-01-10T11:00:00'),
      },
   ]

   const formatTimestamp = (timestamp) => {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 1000 / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `${days}일 전`
      if (hours > 0) return `${hours}시간 전`
      if (minutes > 0) return `${minutes}분 전`
      return '방금 전'
   }

   const getActivityIcon = (type) => {
      switch (type) {
         case 'STOCK_VIEW':
            return '👁️'
         case 'WATCHLIST_ADD':
            return '⭐'
         case 'POST_WRITE':
            return '✍️'
         default:
            return '📝'
      }
   }

   const getActivityDescription = (activity) => {
      switch (activity.type) {
         case 'STOCK_VIEW':
            return `${activity.name}(${activity.symbol}) 종목을 조회했습니다.`
         case 'WATCHLIST_ADD':
            return `${activity.name}(${activity.symbol}) 종목을 관심목록에 추가했습니다.`
         case 'POST_WRITE':
            return `"${activity.title}" 게시글을 작성했습니다.`
         default:
            return '활동을 수행했습니다.'
      }
   }

   if (activities.length === 0) {
      return (
         <EmptyContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyIcon>📭</EmptyIcon>
            <EmptyMessage>아직 활동 내역이 없습니다.</EmptyMessage>
         </EmptyContainer>
      )
   }

   return (
      <Container>
         <AnimatePresence>
            {activities.map((activity) => (
               <ActivityItem key={activity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ scale: 1.02 }}>
                  <IconContainer>{getActivityIcon(activity.type)}</IconContainer>
                  <ActivityContent>
                     <ActivityDescription>{getActivityDescription(activity)}</ActivityDescription>
                     <ActivityTime>{formatTimestamp(activity.timestamp)}</ActivityTime>
                  </ActivityContent>
               </ActivityItem>
            ))}
         </AnimatePresence>
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
   align-items: flex-start;
   padding: ${({ theme }) => theme.spacing.lg};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   transition: ${({ theme }) => theme.transitions.quick};
`

const IconContainer = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   margin-right: ${({ theme }) => theme.spacing.md};
   min-width: 40px;
   height: 40px;
   display: flex;
   align-items: center;
   justify-content: center;
   background: ${({ theme }) => theme.colors.surfaceLight};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const ActivityContent = styled.div`
   flex: 1;
`

const ActivityDescription = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ActivityTime = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const EmptyContainer = styled(motion.div)`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   padding: ${({ theme }) => theme.spacing.xxl};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const EmptyIcon = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxxl};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EmptyMessage = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   color: ${({ theme }) => theme.colors.textSecondary};
`

export default ActivityList
