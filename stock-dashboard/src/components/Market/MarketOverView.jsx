import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMarketOverview, selectMarketOverview, selectMarketOverviewStatus, selectMarketOverviewError } from '../../store/slices/stockSlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'

const MarketOverview = () => {
   const dispatch = useDispatch()
   const marketOverview = useSelector(selectMarketOverview)
   const status = useSelector(selectMarketOverviewStatus)
   const error = useSelector(selectMarketOverviewError)

   useEffect(() => {
      dispatch(fetchMarketOverview())
   }, [dispatch])

   if (status === 'loading') {
      return (
         <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <LoadingMessage>시장 데이터를 불러오는 중...</LoadingMessage>
         </LoadingContainer>
      )
   }

   if (status === 'failed') {
      return (
         <ErrorContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={() => dispatch(fetchMarketOverview())}>다시 시도</RetryButton>
         </ErrorContainer>
      )
   }

   if (!marketOverview || marketOverview.length === 0) {
      return (
         <ErrorContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorMessage>시장 데이터가 없습니다.</ErrorMessage>
         </ErrorContainer>
      )
   }

   const formatChartData = (item) => {
      return [
         {
            name: '전일 종가',
            가격: item.regularMarketPreviousClose,
         },
         {
            name: '현재 가격',
            가격: item.regularMarketPrice,
         },
      ]
   }

   // 현재 시장 개요는 정적인 데이터로만 구성되어 있음.
   // 따라서 데이터가 변경되지 않으므로 데이터 변경 시 컴포넌트를 리렌더링 하지 않음.
   // 서버 가동 기준으로 데이터를 가져오므로 데이터가 실시간으로 변동되지 않음. (실시간 데이터 변경은 api 호출 제한 때문에 추후 문제 점 해결 후 실시간으로 데이터 변경 구현 예정)

   return (
      <Container>
         <MarketGrid>
            <AnimatePresence>
               {marketOverview.map((item) => {
                  if (!item) return null // 데이터가 없으면 렌더링하지 않음

                  const price = item.price || 0 // 가격이 없는 경우 기본값 설정
                  const changePercent = item.changePercent || 0 // 변동률이 없는 경우 기본값 설정
                  const regularMarketVolume = item.regularMarketVolume || 0 // 거래량이 없는 경우 기본값 설정
                  const fiftyTwoWeekHigh = item.fiftyTwoWeekHigh || 0 // 52주 최고가가 없는 경우 기본값 설정
                  const fiftyTwoWeekLow = item.fiftyTwoWeekLow || 0 // 52주 최저가가 없는 경우 기본값 설정

                  return (
                     <MarketCard key={item.symbol} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                        <MarketHeader>
                           <MarketInfo>
                              <MarketName>{item.name}</MarketName>
                              <MarketSymbol>{item.symbol}</MarketSymbol>
                           </MarketInfo>
                           <MarketStatus $isOpen={item.marketState === 'OPEN'}>{item.marketState === 'OPEN' ? '거래중' : '거래종료'}</MarketStatus>
                        </MarketHeader>

                        <PriceInfo>
                           <CurrentPrice>
                              {price.toLocaleString()} {item.currency}
                           </CurrentPrice>
                           <PriceChange $isPositive={changePercent >= 0}>
                              {changePercent >= 0 ? '+' : ''}
                              {changePercent.toFixed(2)}%
                           </PriceChange>
                        </PriceInfo>

                        <ChartContainer>
                           <ResponsiveContainer width="100%" height={150}>
                              <LineChart data={formatChartData(item)} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" vertical={false} />
                                 <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#A0A0A0' }} axisLine={false} tickLine={false} />
                                 <YAxis tick={{ fontSize: 12, fill: '#A0A0A0' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(value) => value.toLocaleString()} />
                                 <Tooltip
                                    contentStyle={{
                                       background: '#1E1E1E',
                                       border: '1px solid #333',
                                       borderRadius: '4px',
                                       padding: '8px',
                                    }}
                                    labelStyle={{ color: '#A0A0A0' }}
                                    formatter={(value) => value.toLocaleString()}
                                 />
                                 <Line type="monotone" dataKey="가격" stroke={changePercent >= 0 ? '#26A69A' : '#EF5350'} strokeWidth={2} dot={{ strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                              </LineChart>
                           </ResponsiveContainer>
                        </ChartContainer>

                        <MarketDetails>
                           <DetailItem>
                              <DetailLabel>거래량</DetailLabel>
                              <DetailValue>{regularMarketVolume.toLocaleString()}</DetailValue>
                           </DetailItem>
                           <DetailItem>
                              <DetailLabel>52주 최고</DetailLabel>
                              <DetailValue>{fiftyTwoWeekHigh.toLocaleString()}</DetailValue>
                           </DetailItem>
                           <DetailItem>
                              <DetailLabel>52주 최저</DetailLabel>
                              <DetailValue>{fiftyTwoWeekLow.toLocaleString()}</DetailValue>
                           </DetailItem>
                        </MarketDetails>
                     </MarketCard>
                  )
               })}
            </AnimatePresence>
         </MarketGrid>
      </Container>
   )
}

const Container = styled.div`
   width: 100%;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const MarketGrid = styled.div`
   margin-top: ${({ theme }) => theme.spacing.xl};
   margin-bottom: ${({ theme }) => theme.spacing.xl};
   flex-wrap: wrap;
   gap: ${({ theme }) => theme.spacing.lg};
`

const MarketCard = styled(motion.div)`
   margin-bottom: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.xl};
   border: 1px solid ${({ theme }) => theme.colors.border};
`

const MarketHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: flex-start;
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const MarketInfo = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xs};
`

const MarketName = styled.h3`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
`

const MarketSymbol = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const MarketStatus = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ $isOpen, theme }) => ($isOpen ? theme.colors.success : theme.colors.textSecondary)};
   padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   background: ${({ $isOpen, theme }) => ($isOpen ? `${theme.colors.success}15` : `${theme.colors.textSecondary}15`)};
`

const PriceInfo = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CurrentPrice = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const PriceChange = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ $isPositive, theme }) => ($isPositive ? theme.colors.success : theme.colors.error)};
`

const ChartContainer = styled.div`
   margin: ${({ theme }) => theme.spacing.lg} 0;
   padding: ${({ theme }) => theme.spacing.md} 0;
   border-top: 1px solid ${({ theme }) => theme.colors.border};
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const MarketDetails = styled.div`
   display: grid;
   grid-template-columns: repeat(3, 1fr);
   gap: ${({ theme }) => theme.spacing.md};
   margin-top: ${({ theme }) => theme.spacing.lg};
`

const DetailItem = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xs};
`

const DetailLabel = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const DetailValue = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
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
   text-align: center;
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

const RetryButton = styled(motion.button)`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      opacity: 0.9;
   }
`

export default MarketOverview
