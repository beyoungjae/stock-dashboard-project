import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import FlipNumbers from 'react-flip-numbers'
import { selectCurrentStock, selectStatus, selectErrors, getQuote, subscribeToQuote, setConnectionStatus, fetchStockNews } from '../../store/slices/stockSlice'
import StockChart from '../../components/Stocks/StockChart'
import NewsList from '../../components/Stocks/NewsList'
import RefreshIcon from '@mui/icons-material/Refresh'

const StockDetail = () => {
   const { symbol } = useParams()
   const dispatch = useDispatch()
   const currentStock = useSelector(selectCurrentStock)
   const status = useSelector(selectStatus)
   const errors = useSelector(selectErrors)
   // const isConnected = useSelector(selectConnectionStatus) // 연결 상태 [테스트용]
   // const [marketStatus, setMarketStatus] = useState('UNKNOWN') // 시장 상태 UNKNOWN = 알 수 없음 [테스트용]

   useEffect(() => {
      if (!symbol) return

      // 초기 데이터 로드
      dispatch(getQuote(symbol))

      // SSE 구독 설정 SSE = Server-Sent Events 서버에서 프론트엔드로 이벤트를 보내는 방식, axios는 동적으로 데이터를 요청하는 방식
      // 실시간으로 데이터를 받아오기 위해서는 SSE를 사용해야 함
      const unsubscribe = dispatch(subscribeToQuote(symbol)) // 주식 실시간 데이터 구독

      // 컴포넌트 언마운트 시 정리
      return () => {
         if (unsubscribe) {
            unsubscribe()
            dispatch(setConnectionStatus(false))
            // setMarketStatus('UNKNOWN') [테스트용]
         }
      }
   }, [symbol, dispatch])

   // // 시장 상태 업데이트 [테스트용]
   // useEffect(() => {
   //    if (currentStock?.marketStatus) {
   //       setMarketStatus(currentStock.marketStatus)
   //    }
   // }, [currentStock])

   // 로딩 상태 표시
   if (status.quote === 'loading') {
      return (
         <LoadingContainer>
            <LoadingBar initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, repeat: Infinity }} />
            <LoadingText>데이터를 불러오는 중</LoadingText>
         </LoadingContainer>
      )
   }

   // 오류일 때
   if (errors.quote) {
      return (
         <ErrorContainer>
            <ErrorMessage>{errors.quote}</ErrorMessage>
         </ErrorContainer>
      )
   }

   // 주식 정보가 없을 때
   if (!currentStock || !symbol) {
      return (
         <ErrorContainer>
            <ErrorMessage>주식 정보를 찾을 수 없습니다.</ErrorMessage>
         </ErrorContainer>
      )
   }

   // 가격 포맷팅 함수
   const formatPrice = (price, isKoreanStock) => {
      if (isKoreanStock) {
         return Math.floor(price).toString()
      }
      return price.toFixed(2)
   }

   // 주식 정보 표시 부분
   const isPositive = currentStock.change > 0 // 변동 상태가 양수인지 확인
   const changePercent = Number(currentStock.changePercent).toFixed(2) // 변동 비율 포맷팅 소수점 2자리까지
   const isKoreanStock = symbol?.endsWith('.KS') ?? false // 주식 종류 확인 KS = 한국 주식
   const formattedPrice = formatPrice(Number(currentStock.price), isKoreanStock) // 가격 포맷팅 한국 주식일 경우 천 단위 절사
   const formattedChange = formatPrice(Math.abs(Number(currentStock.change)), isKoreanStock) // 변동 포맷팅 한국 주식일 경우 천 단위 절사
   const formatNumber = (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
   } // 숫자 천 단위 콤마 추가

   // 시가총액 포맷팅 함수
   const formatMarketCap = (marketCap, isKorean) => {
      const trillion = 1000000000000 // 1조
      const billion = 100000000 // 1억
      const tenmillion = 10000000 // 1천만

      const marketCapNumber = Number(marketCap) // 시가총액 숫자로 변환

      // 한국 주식인 경우
      if (isKorean) {
         if (marketCapNumber >= trillion) {
            return `${(marketCapNumber / trillion).toFixed(0)}조 원`
         } else if (marketCapNumber >= billion) {
            return `${(marketCapNumber / billion).toFixed(0)}억 원`
         } else if (marketCapNumber >= tenmillion) {
            return `${(marketCapNumber / tenmillion).toFixed(0)}천만 원`
         } else {
            return `${marketCapNumber.toLocaleString()}원`
         }
      } else {
         // 미국 주식인 경우
         if (marketCapNumber >= trillion) {
            return `${(marketCapNumber / trillion).toFixed(0)}조 달러`
         } else if (marketCapNumber >= billion) {
            return `${(marketCapNumber / billion).toFixed(0)}억 달러`
         } else if (marketCapNumber >= tenmillion) {
            return `${(marketCapNumber / tenmillion).toFixed(0)}천만 달러`
         } else {
            return `${marketCapNumber.toLocaleString()}달러`
         }
      }
   }

   // 가격 표시 테스트용
   // const displayPrice = isKoreanStock ? `${formattedPrice}원` : `$${formattedPrice}`
   // const displayChange = isKoreanStock ? `${formattedChange}원` : `$${formattedChange}`

   // 52주 최고/최저 가격 표시
   const displayFiftyTwoWeekHigh = isKoreanStock ? `${Number(currentStock.fiftyTwoWeekHigh).toLocaleString()}원` : `$${Number(currentStock.fiftyTwoWeekHigh).toLocaleString()}`
   const displayFiftyTwoWeekLow = isKoreanStock ? `${Number(currentStock.fiftyTwoWeekLow).toLocaleString()}원` : `$${Number(currentStock.fiftyTwoWeekLow).toLocaleString()}`

   // 시가총액 표시
   const displayMarketCap = currentStock.marketCap ? formatMarketCap(currentStock.marketCap, isKoreanStock) : '정보 없음'

   return (
      <>
         <TitleName>{currentStock?.name} 상세 데이터</TitleName>
         <DetailContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <MainContent>
               <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <MainInfo>
                     <SymbolSection>
                        <CompanyName>{currentStock?.name}</CompanyName>
                        <Exchange>{currentStock?.exchange}</Exchange>
                     </SymbolSection>
                     <Symbol>{symbol}</Symbol>
                  </MainInfo>

                  <PriceInfo>
                     <Price>
                        {!isKoreanStock && <span className="currency">$</span>}
                        <NumberGroup>
                           {formatNumber(formattedPrice)
                              .split('')
                              .map((char, index) => (
                                 <React.Fragment key={index}>{char === ',' ? <NumberSeparator>,</NumberSeparator> : <FlipNumbers height={48} width={32} color="white" background="transparent" play perspective={1000} duration={0.5} numbers={char} />}</React.Fragment>
                              ))}
                        </NumberGroup>
                        {isKoreanStock && <span className="unit">원</span>}
                     </Price>
                     <Change $isPositive={isPositive}>
                        <span>
                           {currentStock.change >= 0 ? '+' : '-'}
                           {!isKoreanStock && '$'}
                           <NumberGroup>
                              {formatNumber(formattedChange)
                                 .split('')
                                 .map((char, index) => (
                                    <React.Fragment key={index}>
                                       {char === ',' ? <NumberSeparator2 $isPositive={isPositive}>,</NumberSeparator2> : <FlipNumbers height={24} width={20} color={isPositive ? '#4eaf0a' : '#e01e1e'} background="transparent" play perspective={1000} duration={0.5} numbers={char} />}
                                    </React.Fragment>
                                 ))}
                           </NumberGroup>
                           {isKoreanStock && <span className="unit">원</span>}
                        </span>
                        <span className="percent">
                           ({currentStock.changePercent >= 0 ? '+' : '-'}
                           {Math.abs(changePercent)}%)
                        </span>
                     </Change>
                  </PriceInfo>
               </Header>

               <ChartSection initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <StockChart symbol={symbol} />
               </ChartSection>

               <StatsGrid initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  {[
                     { label: '거래량', value: formatNumber(currentStock?.volume) },
                     { label: '시가총액', value: displayMarketCap },
                     { label: '52주 최고', value: displayFiftyTwoWeekHigh },
                     { label: '52주 최저', value: displayFiftyTwoWeekLow },
                  ].map((stat, index) => (
                     <StatCard key={stat.label} whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
                        <StatLabel>{stat.label}</StatLabel>
                        <StatValue>{stat.value}</StatValue>
                     </StatCard>
                  ))}
               </StatsGrid>
            </MainContent>

            <NewsSection initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
               <NewsHeader>
                  <NewsTitle>최근 뉴스</NewsTitle>
                  <SourceTitle>출처 : yahoo finance</SourceTitle>
                  <NewsRefreshButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9, rotate: 360 }} onClick={() => dispatch(fetchStockNews(symbol))}>
                     <RefreshIcon sx={{ fontSize: '24px', color: 'white' }} />
                  </NewsRefreshButton>
               </NewsHeader>
               <NewsList symbol={symbol} />
            </NewsSection>
         </DetailContainer>
      </>
   )
}

const TitleName = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
`

/* const ConnectionStatus = styled.div`
   top: 1rem;
   right: 1rem;
   padding: 0.5rem 1rem;
   border-radius: ${({ theme }) => theme.borderRadius.small};
   background: ${({ theme, $isConnected }) => ($isConnected ? theme.colors.success : theme.colors.error)};
   color: white;
   font-size: 0.875rem;
   z-index: 1000;
   position: fixed;
`

const MarketStatusBadge = styled.div`
   top: 3rem;
   right: 1rem;
   padding: 0.5rem 1rem;
   border-radius: ${({ theme }) => theme.borderRadius.small};
   background: ${({ theme, $status }) => {
      switch ($status) {
         case 'OPEN':
            return theme.colors.success
         case 'CLOSED':
            return theme.colors.error
         default:
            return theme.colors.warning
      }
   }};
   color: white;
   font-size: 0.875rem;
   z-index: 1000;
   position: fixed;
` */

const DetailContainer = styled(motion.div)`
   max-width: 1400px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
   display: grid;
   grid-template-columns: 1fr 350px;
   gap: ${({ theme }) => theme.spacing.xl};

   @media (max-width: 1200px) {
      grid-template-columns: 1fr;
   }
`

const MainContent = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xl};
`

const Header = styled(motion.div)`
   background: ${({ theme }) => theme.colors.surface};
   padding: ${({ theme }) => theme.spacing.xl};
   border-radius: ${({ theme }) => theme.borderRadius.large};
   box-shadow: ${({ theme }) => theme.shadows.medium};
   backdrop-filter: blur(10px);
`

const ChartSection = styled(motion.div)`
   background: ${({ theme }) => theme.colors.surface};
   padding: ${({ theme }) => theme.spacing.lg};
   border-radius: ${({ theme }) => theme.borderRadius.large};
   box-shadow: ${({ theme }) => theme.shadows.medium};
   backdrop-filter: blur(10px);
`

const StatsGrid = styled(motion.div)`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
   gap: ${({ theme }) => theme.spacing.md};
`

const StatCard = styled(motion.div)`
   background: ${({ theme }) => theme.colors.surface};
   padding: ${({ theme }) => theme.spacing.lg};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   box-shadow: ${({ theme }) => theme.shadows.medium};
   backdrop-filter: blur(10px);
   transition: all 0.3s ease;
`

const NewsSection = styled(motion.aside)`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.large};
   padding: ${({ theme }) => theme.spacing.lg};
   height: fit-content;
   position: sticky;
   top: 20px;
   box-shadow: ${({ theme }) => theme.shadows.medium};
   backdrop-filter: blur(10px);
`

const MainInfo = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const SymbolSection = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const Symbol = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin: 0;
`

const Exchange = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   background: ${({ theme }) => theme.colors.background};
   padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   text-transform: uppercase;
`

const CompanyName = styled.h2`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
`

const PriceInfo = styled.div`
   text-align: right;
   display: flex;
   flex-direction: column;
   align-items: flex-end;
   gap: 4px;
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   font-feature-settings: 'tnum' on, 'lnum' on;
`

const NumberGroup = styled.div`
   display: inline-flex;
   align-items: center;
`

const NumberSeparator = styled.span`
   gap: 8px;
   height: 56px;
   font-size: 48px;
   font-weight: 600;
   color: ${({ theme }) => theme.colors.text};
   letter-spacing: -0.02em;
`

const Price = styled.div`
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 8px;
   height: 56px;
   font-size: 48px;
   font-weight: 600;
   color: ${({ theme }) => theme.colors.text};
   letter-spacing: -0.02em;

   .currency {
      font-size: 40px;
      font-weight: 500;
      opacity: 0.9;
      margin-right: -4px;
   }

   .unit {
      font-size: 32px;
      font-weight: 500;
      opacity: 0.9;
   }
`

const NumberSeparator2 = styled.span`
   gap: 4px;
   height: 28px;
   font-size: 20px;
   font-weight: 500;
   color: ${({ $isPositive }) => ($isPositive ? '#4eaf0a' : '#e01e1e')};
   letter-spacing: 0;
`

const Change = styled(motion.div)`
   display: flex;
   align-items: center;
   justify-content: flex-end;
   gap: 4px;
   height: 28px;
   font-size: 20px;
   font-weight: 500;
   color: ${({ $isPositive }) => ($isPositive ? '#4eaf0a' : '#e01e1e')};
   letter-spacing: 0;

   span {
      display: flex;
      align-items: center;
      gap: 2px;
   }

   .unit {
      font-size: 18px;
      opacity: 0.95;
   }

   .percent {
      margin-left: 4px;
      color: ${({ $isPositive }) => ($isPositive ? '#4eaf0a' : '#e01e1e')};
      opacity: 0.9;
   }
`

const StatLabel = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const StatValue = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
`

const LoadingContainer = styled.div`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const LoadingBar = styled(motion.div)`
   height: 20px;
   background-color: ${({ theme }) => theme.colors.primary};
   border-radius: 10px;
   overflow: hidden;
`

const LoadingText = styled.div`
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
`

const ErrorContainer = styled.div`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
   text-align: center;
`

const ErrorMessage = styled.div`
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   border: 1px solid ${({ theme }) => theme.colors.border};
`

const NewsHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const NewsTitle = styled.h3`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   color: ${({ theme }) => theme.colors.text};
   margin: 0;
`

const SourceTitle = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const NewsRefreshButton = styled(motion.button)`
   background: none;
   border: none;
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   cursor: pointer;
   padding: ${({ theme }) => theme.spacing.xs};
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;

   &:hover {
      background: ${({ theme }) => theme.colors.surfaceHover};
   }
`

export default StockDetail
