import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import ActivityList from '../components/ActivityList'

const MyDashboard = () => {
   return (
      <Container>
         <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Title>내 대시보드</Title>
            <Description>최근 활동 내역을 확인하고 관리하세요. 종목 조회, 관심 목록 추가, 게시글 작성 등 모든 활동을 한눈에 볼 수 있습니다.</Description>
         </Header>
         <Content>
            <Section>
               <SectionHeader>
                  <SectionTitle>최근 활동</SectionTitle>
                  <SectionDescription>최근 7일간의 활동 내역입니다.</SectionDescription>
               </SectionHeader>
               <ActivityList />
            </Section>
         </Content>
      </Container>
   )
}

const Container = styled.div`
   max-width: 1600px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Header = styled(motion.div)`
   margin-bottom: ${({ theme }) => theme.spacing.xxl};
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0 0 ${({ theme }) => theme.spacing.md};
   background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
`

const Description = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
   line-height: 1.6;
   margin: 0;
   max-width: 800px;
`

const Content = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xl};
`

const Section = styled.section`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.lg};
`

const SectionHeader = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.md};
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
