import React, { useEffect, useState, useCallback } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Area, ResponsiveContainer, ComposedChart } from 'recharts'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { stockAPI } from '../api/stock'

const StockChart = ({ symbol }) => {
   // 부모 컴포넌트에서 전달된 symbol 값을 사용하여 주식 차트 데이터를 불러오기
   const [chartData, setChartData] = useState([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const [chartRange, setChartRange] = useState('1d') // 기본 설정값 1d
   const [chartInterval, setChartInterval] = useState('5m') // 기본 설정값 5m

   // 시장 상태 확인
   const checkMarketStatus = useCallback(() => {
      const now = new Date()
      const day = now.getDay()
      if (day === 0 || day === 6) return false

      const hours = now.getHours()
      const minutes = now.getMinutes()

      if (symbol?.endsWith('.KS') || symbol?.endsWith('.KQ')) {
         return (hours > 9 || (hours === 9 && minutes >= 0)) && (hours < 15 || (hours === 15 && minutes <= 30)) // 한국 주식 거래 시간
      }

      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      return nyTime.getHours() >= 9 && nyTime.getHours() < 16 // 미국 주식 거래 시간
   }, [symbol])

   // 차트 데이터 검증
   const validateChartData = useCallback(
      (data, range) => {
         // 차트 데이터 포인트 수 설정 (주식 시장 상태에 따라 포인트 수 조정)
         const minPoints =
            {
               '1d': checkMarketStatus() ? 25 : 15, // 1d 차트 데이터 포인트 수
               '5d': 25, // 5d 차트 데이터 포인트 수
               '1mo': 15, // 1mo 차트 데이터 포인트 수
            }[range] || 15

         // 만약, 데이터가 배열이 아니거나 데이터가 없다면 오류 출력
         if (!Array.isArray(data) || data.length === 0) {
            throw new Error('데이터를 받아올 수 없습니다.')
         }

         // 만약, 데이터 포인트 수가 최소 포인트 수보다 적다면 경고 메시지 출력
         if (data.length < minPoints) {
            console.warn(`데이터 포인트: ${data.length}/${minPoints}`)
            if (data.length >= minPoints * 0.5) {
               return data
            }
            throw new Error(`거래량이 부족하여 차트를 표시할 수 없습니다. (${data.length}/${minPoints})`)
         }

         return data
      },
      [checkMarketStatus]
   )

   // 차트 데이터 가져오기
   const fetchChartData = async () => {
      if (!symbol) return // 주식 종목 데이터가 없으면 종료

      try {
         setLoading(true)
         setError(null)

         if (chartData.length === 0) {
            setChartData(Array(50).fill({ date: '', price: 0, volume: 0 })) // 차트 데이터가 없으면 50개의 데이터 생성
         }

         let response = null // 차트 데이터 응답 초기화
         let retryCount = 0 // 차트 데이터 간격 반복 횟수 초기화
         const intervals = {
            '1d': ['5m', '15m', '30m'], // 1d 차트 데이터 간격
            '5d': ['15m', '30m', '1h'], // 5d 차트 데이터 간격
            '1mo': ['1d', '1wk'], // 1mo 차트 데이터 간격
         }

         // 차트 데이터 간격 반복
         while (retryCount < intervals[chartRange].length) {
            // retryCount가 차트 데이터 간격 수보다 작으면 반복
            const currentInterval = intervals[chartRange][retryCount] // 현재 차트 데이터 간격

            try {
               response = await stockAPI.getChart(symbol, {
                  range: chartRange, // 차트 데이터 범위
                  interval: currentInterval, // 차트 데이터 간격
               })

               // 차트 데이터 포맷팅
               const formattedData = response
                  .map((item) => {
                     try {
                        const date = new Date(item.date) // 날짜 데이터
                        const price = Number(item.close || 0) // 종가 데이터
                        const volume = Number(item.volume || 0) // 거래량 데이터

                        if (isNaN(date.getTime()) || isNaN(price) || price <= 0) {
                           // 날짜 데이터가 유효하지 않거나 종가 데이터가 0 이하라면 오류 출력
                           console.error('유효하지 않은 데이터:', item)
                           return null
                        }

                        // 날짜 데이터 포맷팅
                        let formattedDate
                        if (chartRange === '1d') {
                           formattedDate = date.toLocaleTimeString('ko-KR', {
                              hour: '2-digit', // 시간 데이터
                              minute: '2-digit', // 분 데이터
                              hour12: false, // 12시간 기준 아닌 24시간 기준
                           })
                        } else if (chartRange === '5d') {
                           formattedDate = `${date.getMonth() + 1}.${date.getDate()}` // 5일 차트 데이터 포맷팅
                        } else {
                           formattedDate = `${date.getMonth() + 1}.${date.getDate()}` // 1개월 차트 데이터 포맷팅
                        }

                        return {
                           rawDate: item.date, // 원본 날짜 데이터
                           date: formattedDate, // 포맷팅된 날짜 데이터
                           price, // 종가 데이터
                           volume, // 거래량 데이터
                        }
                     } catch (err) {
                        console.error('데이터 포맷팅 오류:', err, item)
                        return null
                     }
                  })
                  .filter(Boolean) // 데이터가 없으면 필터링

               if (formattedData.length === 0) {
                  throw new Error('유효한 차트 데이터가 없습니다.')
               }
               const validatedData = validateChartData(formattedData, chartRange) // 차트 데이터 검증

               setChartData(validatedData) // 검증된 차트 데이터 설정
               setError(null)
               break
            } catch (error) {
               if (retryCount === intervals[chartRange].length - 1) {
                  throw error // 차트 데이터 검증 실패 시 오류 출력
               }
               await new Promise((resolve) => setTimeout(resolve, 1000)) // 1초 대기
            }

            retryCount++ // 차트 데이터 간격 반복 횟수 증가
         }
      } catch (error) {
         console.error('차트 데이터 로딩 실패:', error) // 차트 데이터 로딩 실패 시 오류 출력
         setError(error.message) // 오류 메시지 설정
         if (chartData.length === 50 && chartData[0].date === '') {
            setChartData([]) // 차트 데이터가 50개이고 첫 번째 데이터가 비어있으면 차트 데이터 초기화
         }
      } finally {
         setLoading(false) // 로딩 상태 초기화
      }
   }

   useEffect(() => {
      let isMounted = true // 컴포넌트 마운트 시 플래그 설정

      const loadData = async () => {
         if (!isMounted) return // 컴포넌트 언마운트 시 종료
         await fetchChartData() // 차트 데이터 로딩
      }

      loadData() // 차트 데이터 로딩

      return () => {
         isMounted = false // 컴포넌트 언마운트 시 플래그 초기화
      }
      // eslint-disable-next-line
   }, [symbol, chartRange, chartInterval, validateChartData]) // 차트 데이터 로딩 함수 실행

   const handleRangeChange = (range) => {
      setChartRange(range) // 차트 데이터 범위 설정
      switch (range) {
         case '1d':
            setChartInterval('5m') // 1일 차트 데이터 간격 설정
            break
         case '5d':
            setChartInterval('15m') // 5일 차트 데이터 간격 설정
            break
         case '1mo':
            setChartInterval('1d') // 1개월 차트 데이터 간격 설정
            break
         default:
            setChartInterval('1d') // 기본 차트 데이터 간격 설정, 디폴트값 1일
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
                  <XAxis dataKey="date" stroke="#A0A0A0" tick={{ fill: '#A0A0A0', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={50} />
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
                     labelFormatter={(label) => {
                        const date = new Date(chartData.find((item) => item.date === label)?.rawDate || '')
                        if (isNaN(date.getTime())) return label

                        return date.toLocaleDateString('ko-KR', {
                           year: 'numeric', // 년도 데이터
                           month: 'long', // 월 데이터
                           day: 'numeric', // 일 데이터
                           weekday: 'long', // 요일 데이터
                        })
                     }}
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
                  <XAxis dataKey="date" stroke="#A0A0A0" tick={{ fill: '#A0A0A0', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={50} />
                  <YAxis
                     stroke="#A0A0A0"
                     tick={{ fill: '#A0A0A0', fontSize: 11 }}
                     tickLine={false}
                     axisLine={false}
                     tickCount={3}
                     tickFormatter={(value) => {
                        if (value >= 1000000) {
                           // 100만 이상이면 100만 단위로 표시
                           return `${(value / 1000000).toFixed(1)}M` // 100만 단위로 표시
                        } else if (value >= 1000) {
                           // 1000 이상이면 1000 단위로 표시
                           return `${(value / 1000).toFixed(1)}K` // 1000 단위로 표시
                        }
                        return value // 그 외 값은 그대로 표시
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
