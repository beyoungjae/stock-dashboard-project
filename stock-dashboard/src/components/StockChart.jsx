import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer, ComposedChart } from 'recharts'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { stockAPI } from '../api/stock'

const StockChart = ({ symbol }) => {
   const [chartData, setChartData] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const [chartRange, setChartRange] = useState('1d') // 차트 범위 기본 1일
   const [chartInterval, setChartInterval] = useState('5m') // 차트 간격 기본 5분

   useEffect(() => {
      let isMounted = true
      const fetchChartData = async () => {
         if (!symbol) return // 심볼이 없으면 종료

         try {
            setLoading(true)
            setError(null)

            // 이전 데이터 유지 (스켈레톤 효과)
            if (chartData.length === 0) {
               setChartData(Array(50).fill({ date: '', price: 0, volume: 0 })) // 이전 데이터 유지 (스켈레톤 효과)
            }

            const response = await stockAPI.getChart(symbol, {
               // 차트 데이터 조회
               range: chartRange,
               interval: chartInterval,
            })

            if (!isMounted) return // 컴포넌트가 언마운트되면 종료

            if (!response || !Array.isArray(response)) {
               // 차트 데이터 유효성 검사
               throw new Error('유효하지 않은 차트 데이터')
            }

            // 데이터 포맷팅
            const formattedData = response
               .map((item) => {
                  try {
                     const date = new Date(item.date) // 날짜 포맷팅
                     const price = Number(item.close || 0) // 가격 포맷팅
                     const volume = Number(item.volume || 0) // 거래량 포맷팅

                     // 데이터 유효성 검사
                     if (isNaN(date.getTime()) || isNaN(price) || price <= 0) {
                        // 날짜, 가격, 거래량 유효성 검사
                        console.error('유효하지 않은 데이터:', item)
                        return null
                     }

                     return {
                        date: chartRange === '1d' ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }), // 날짜 포맷팅
                        price,
                        volume,
                     }
                  } catch (err) {
                     console.error('데이터 포맷팅 오류:', err, item)
                     return null
                  }
               })
               .filter(Boolean) // null 값 제거

            if (formattedData.length === 0) {
               throw new Error('유효한 차트 데이터가 없습니다.')
            }

            setChartData(formattedData)
         } catch (error) {
            console.error('차트 데이터 로딩 실패:', error)
            if (isMounted) {
               setError(error.message || '차트 데이터를 불러오는데 실패했습니다.')
               // 에러 발생 시 이전 데이터 유지
               if (chartData.length === 0) {
                  setChartData([])
               }
            }
         } finally {
            if (isMounted) {
               setLoading(false)
            }
         }
      }

      // 차트 데이터 로드
      fetchChartData()

      return () => {
         isMounted = false
      }
   }, [symbol, chartRange, chartInterval])

   // 차트 범위 변경
   const handleRangeChange = (range) => {
      setChartRange(range)
      switch (range) {
         case '1d':
            setChartInterval('5m') // 1일 차트는 5분 간격
            break
         case '5d':
            setChartInterval('15m') // 5일 차트는 15분 간격
            break
         case '1mo':
            setChartInterval('1d') // 1개월 차트는 1일 간격
            break
         default:
            setChartInterval('1d') // 기본 간격은 1일
      }
   }

   // 차트 렌더링
   const renderChart = () => {
      return (
         <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="70%">
               <ComposedChart
                  data={chartData}
                  margin={{
                     top: 20,
                     right: 30,
                     left: 20,
                     bottom: 0,
                  }}
               >
                  <defs>
                     <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#26A69A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#26A69A" stopOpacity={0} />
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#2C2C2C" vertical={false} />
                  <XAxis dataKey="date" stroke="#A0A0A0" tick={{ fill: '#A0A0A0', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={50} />
                  <YAxis stroke="#A0A0A0" tick={{ fill: '#A0A0A0', fontSize: 11 }} tickLine={false} axisLine={false} tickCount={6} domain={['auto', 'auto']} tickFormatter={(value) => Number(value).toLocaleString()} />
                  <Tooltip
                     contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        fontSize: '12px',
                     }}
                     labelStyle={{ color: '#A0A0A0' }}
                     itemStyle={{ color: '#FFFFFF' }}
                     formatter={(value) => Number(value).toLocaleString()}
                  />
                  <Area type="monotone" dataKey="price" stroke="#26A69A" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" dot={false} activeDot={{ r: 4, fill: '#26A69A' }} />
               </ComposedChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="25%">
               <ComposedChart
                  data={chartData}
                  margin={{
                     top: 5,
                     right: 30,
                     left: 20,
                     bottom: 0,
                  }}
               >
                  <CartesianGrid strokeDasharray="2 2" stroke="#2C2C2C" vertical={false} />
                  <XAxis dataKey="date" stroke="#A0A0A0" tick={{ fill: '#A0A0A0', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={50} />
                  <YAxis
                     stroke="#A0A0A0"
                     tick={{ fill: '#A0A0A0', fontSize: 11 }}
                     tickLine={false}
                     axisLine={false}
                     tickCount={3}
                     tickFormatter={(value) => {
                        if (value >= 1000000) {
                           return `${(value / 1000000).toFixed(1)}M`
                        } else if (value >= 1000) {
                           return `${(value / 1000).toFixed(1)}K`
                        }
                        return value
                     }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#26A69A" fill="#26A69A" fillOpacity={0.2} />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      )
   }

   if (loading && chartData.length === 0) {
      return (
         <LoadingContainer $animate={{ rotate: 360 }} $transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <StyledLoadingSpinner $animate={{ rotate: 360 }} $transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <LoadingText>차트 데이터를 불러오는 중...</LoadingText>
         </LoadingContainer>
      )
   }

   if (error) {
      return (
         <ErrorContainer>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton
               onClick={() => {
                  setError(null)
                  setChartData([])
                  setLoading(true)
               }}
            >
               다시 시도
            </RetryButton>
         </ErrorContainer>
      )
   }

   if (!chartData.length) {
      return (
         <ErrorContainer>
            <ErrorMessage>차트 데이터가 없습니다.</ErrorMessage>
         </ErrorContainer>
      )
   }

   return (
      <ChartContainer $animate={{}} $transition={{}}>
         <ChartControls>
            <ControlGroup>
               <RangeButton $active={chartRange === '1d'} onClick={() => handleRangeChange('1d')}>
                  1일
               </RangeButton>
               <RangeButton $active={chartRange === '5d'} onClick={() => handleRangeChange('5d')}>
                  5일
               </RangeButton>
               <RangeButton $active={chartRange === '1mo'} onClick={() => handleRangeChange('1mo')}>
                  1개월
               </RangeButton>
            </ControlGroup>
         </ChartControls>
         {renderChart()}
      </ChartContainer>
   )
}

const ChartContainer = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.lg};
   margin: ${({ theme }) => theme.spacing.lg} 0;
   border: 1px solid ${({ theme }) => theme.colors.border};
   $animate: ${({ $animate }) => $animate};
   $transition: ${({ $transition }) => $transition};
`

const ChartControls = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.lg};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
   flex-wrap: wrap;
`

const ControlGroup = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
`

const BaseButton = styled.button`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   background: ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
   color: ${({ theme, $active }) => ($active ? theme.colors.surface : theme.colors.text)};
   border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   cursor: pointer;
   transition: all 0.2s;
   font-size: 0.9rem;

   &:hover {
      background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
   }
`

const RangeButton = styled(BaseButton)``

const LoadingContainer = styled(motion.div)`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   border: 1px solid ${({ theme }) => theme.colors.border};
`

const StyledLoadingSpinner = styled(motion.div)`
   width: 40px;
   height: 40px;
   border: 3px solid ${({ theme }) => theme.colors.border};
   border-top-color: ${({ theme }) => theme.colors.primary};
   border-radius: 50%;
   margin: 0 auto ${({ theme }) => theme.spacing.md};
`

const LoadingText = styled.div`
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const ErrorMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   border: 1px solid ${({ theme }) => theme.colors.border};
`

const ErrorContainer = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   border: 1px solid ${({ theme }) => theme.colors.border};
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const ErrorIcon = styled.div`
   font-size: 2rem;
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const RetryButton = styled.button`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.small};
   cursor: pointer;
   transition: all 0.2s;
   font-size: 0.9rem;

   &:hover {
      opacity: 0.9;
   }
`

export default StockChart
