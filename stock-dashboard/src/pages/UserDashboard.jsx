import React, { useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUserActivityThunk } from '../store/slices/userSlice'
import ActivityList from '../components/ActivityList'
import UserStats from '../components/UserStats'

const UserDashboard = () => {
   const { userId } = useParams() // 사용자 ID useParams로 가져오기
   const dispatch = useDispatch()
   const { activity, loading, error } = useSelector((state) => state.user)

   useEffect(() => {
      if (userId) {
         dispatch(getUserActivityThunk(userId)) // 사용자 활동 조회
      }
   }, [dispatch, userId])

   if (loading) return <div>로딩중...</div>
   if (error) return <div>에러: {error}</div>

   return (
      <DashboardContainer>
         <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Title>{`${activity?.User?.username}님의 대시보드`}</Title>
            <Description>사용자의 활동 내역을 확인하실 수 있습니다.</Description>
         </Header>

         <Content>
            <Section>
               <SectionHeader>
                  <SectionTitle>활동 통계</SectionTitle>
               </SectionHeader>
               <UserStats />
            </Section>

            <Section>
               <SectionHeader>
                  <SectionTitle>최근 활동</SectionTitle>
               </SectionHeader>
               <ActivityList />
            </Section>
         </Content>
      </DashboardContainer>
   )
}

const DashboardContainer = styled.div`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Header = styled(motion.div)`
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   box-shadow: ${({ theme }) => theme.shadows.medium};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0 0 ${({ theme }) => theme.spacing.md};
`

const Description = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin: 0;
`

const Content = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xl};
`

const Section = styled.section`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.xl};
   box-shadow: ${({ theme }) => theme.shadows.medium};
`

const SectionHeader = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const SectionTitle = styled.h2`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0 0 ${({ theme }) => theme.spacing.xs};
`

export default UserDashboard
