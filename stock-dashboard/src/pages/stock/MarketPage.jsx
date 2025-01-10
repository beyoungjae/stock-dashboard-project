import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import MarketOverview from '../../components/Market/MarketOverView'

const MarketPage = () => {
   return (
      <Container>
         <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Title>시장 개요</Title>
            <Description>주요 시장 지수와 실시간 시장 동향을 한눈에 파악하세요. 각 지수의 현재 가격, 변동률, 거래량 등 중요한 정보를 제공합니다.</Description>
         </Header>
         <MarketOverview />
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

export default MarketPage
