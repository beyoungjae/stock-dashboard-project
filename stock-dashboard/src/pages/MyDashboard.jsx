import { useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import ActivityList from '../components/ActivityList'
import UserStats from '../components/UserStats'
import { getUserActivityThunk } from '../store/slices/userSlice'

const MyDashboard = () => {
   const dispatch = useDispatch()
   const { user } = useSelector((state) => state.auth)
   const { loading, error } = useSelector((state) => state.user)

   useEffect(() => {
      if (user?.id) {
         dispatch(getUserActivityThunk(user.id))
      }
   }, [dispatch, user?.id])

   if (!user) return <div>로그인이 필요합니다.</div>
   if (loading) return <div>Loading...</div>
   if (error) return <div>Error: {error}</div>

   return (
      <DashboardContainer>
         <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '1.5rem' }}>
            <Title>나의 대시보드</Title>
            <Description>안녕하세요, {user.username}님!</Description>
         </Header>

         <Content>
            <Section>
               <SectionHeader>
                  <SectionTitle>활동 통계</SectionTitle>
                  <SectionDescription>지금까지의 활동 내역을 확인해보세요.</SectionDescription>
               </SectionHeader>
               <UserStats />
            </Section>
            <Section>
               <SectionHeader>
                  <SectionTitle>최근 활동</SectionTitle>
                  <SectionDescription>최근 작성한 게시글, 댓글, 좋아요 내역입니다.</SectionDescription>
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

const SectionDescription = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin: 0;
`

export default MyDashboard
