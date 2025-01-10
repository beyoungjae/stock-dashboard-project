import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearSearchResults, getQuote } from '../store/slices/stockSlice'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/shared/SearchBar'
import StockList from '../components/Stocks/StockList'
import { selectStatus, selectSearchResults } from '../store/slices/stockSlice'

// 인기 주식, 코인 목록 데이터 예시로 표시
const popularStocks = [
   {
      symbol: '005930.KS',
      name: '삼성전자',
      description: '대한민국 대표 IT 기업',
      category: '전자/반도체',
   },
   {
      symbol: '035720.KS',
      name: '카카오',
      description: '국민 메신저 카카오톡',
      category: 'IT/플랫폼',
   },
   {
      symbol: '000660.KS',
      name: 'SK하이닉스',
      description: '세계적인 반도체 기업',
      category: '반도체',
   },
   {
      symbol: '035420.KS',
      name: '네이버',
      description: '대한민국 대표 포털',
      category: 'IT/플랫폼',
   },
   {
      symbol: 'MSFT',
      name: '마이크로소프트',
      description: '소프트웨어 및 하드웨어 개발 기업',
      category: '글로벌 IT',
   },
   {
      symbol: 'AAPL',
      name: '애플',
      description: '아이폰, 맥북의 제조사',
      category: '글로벌 IT',
   },
   {
      symbol: 'TSLA',
      name: '테슬라',
      description: '전기차 제조사',
      category: '전기차',
   },
   {
      symbol: 'AMZN',
      name: '아마존',
      description: '전자상거래 및 클라우드 서비스 기업',
      category: '전자상거래',
   },
   {
      symbol: 'NVDA',
      name: '엔비디아',
      description: '그래픽 처리 장치 제조사',
      category: '글로벌 IT',
   },
   {
      symbol: 'GOOGL',
      name: '구글',
      description: '인터넷 검색 및 광고 서비스 기업',
      category: '글로벌 IT',
   },
   {
      symbol: 'BTC-USD',
      name: '비트코인',
      description: '가상화폐',
      category: '가상화폐',
   },
   {
      symbol: 'ETH-USD',
      name: '이더리움',
      description: '가상화폐',
      category: '가상화폐',
   },
]

// 기본 애니메이션 설정
const containerVariants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         when: 'beforeChildren', // 자식 요소들이 애니메이션 시작 전에 렌더링되도록 설정
         staggerChildren: 0.1,
      },
   },
   exit: {
      opacity: 0,
      transition: {
         when: 'afterChildren', // 자식 요소들이 애니메이션 완료 후에 사라지도록 설정
      },
   },
}

// 아이템 애니메이션 설정
const itemVariants = {
   hidden: { opacity: 0, y: 20 },
   visible: {
      opacity: 1,
      y: 0,
   },
   exit: {
      opacity: 0,
      y: -20,
   },
}

const Home = () => {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const status = useSelector(selectStatus)
   const searchResults = useSelector(selectSearchResults) // 검색 결과 상태
   const [searchTerm, setSearchTerm] = useState('') // 검색어 상태
   const [loadingComplete, setLoadingComplete] = useState(false) // 로딩 완료 상태

   // 컴포넌트가 마운트될 때 초기화
   useEffect(() => {
      setSearchTerm('') // 검색어 초기화
      dispatch(clearSearchResults()) // 검색 결과 초기화
   }, [dispatch])

   // 검색어 변경될 때 호출
   const handleSearch = (term) => {
      setSearchTerm(term)
   }

   // 주식 상세 페이지 이동
   const handleStockClick = useCallback(
      (symbol) => {
         dispatch(getQuote(symbol))
         navigate(`/stock/${symbol}`)
      },
      [dispatch, navigate]
   )

   // 로딩 완료 상태 업데이트
   const handleLoadingComplete = () => {
      setLoadingComplete(true)
   }

   // 검색 결과 표시 여부 결정
   const shouldShowSearchResults = status.search === 'loading' || (status.search === 'succeeded' && searchResults && searchResults.length > 0) || (status.search === 'succeeded' && searchTerm.trim().length >= 2)

   return (
      <HomeContainer variants={containerVariants} initial="hidden" animate="visible">
         <SearchSection variants={itemVariants}>
            <WelcomeSection>
               <Title>
                  실시간 검색
                  <TitleIcon>📈</TitleIcon>
               </Title>
               <Subtitle>전 세계 주식, 코인 시장의 실시간 정보를 검색하고 분석하세요</Subtitle>
            </WelcomeSection>
            <SearchBar onSearch={handleSearch} />
         </SearchSection>

         <AnimatePresence mode="wait">
            {shouldShowSearchResults ? (
               <ContentSection key="search-results" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                  <StockList searchTerm={searchTerm} />
                  {!loadingComplete && <LoadingBar initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} onAnimationComplete={handleLoadingComplete} />}
               </ContentSection>
            ) : (
               <PopularStocksSection key="popular-stocks" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
                  <SectionTitle>인기 있는 주식, 코인 둘러보기</SectionTitle>
                  <SectionSubtitle>처음이시라면 이런 종목은 어떠세요?</SectionSubtitle>
                  <StockCardGrid>
                     {popularStocks.map((stock) => (
                        <StockCard
                           key={stock.symbol}
                           variants={itemVariants}
                           whileHover={{
                              y: -4,
                              boxShadow: (theme) => theme.shadows.glow,
                           }}
                           onClick={() => handleStockClick(stock.symbol)}
                        >
                           <CardCategory>{stock.category}</CardCategory>
                           <CardTitle>{stock.name}</CardTitle>
                           <CardSymbol>{stock.symbol}</CardSymbol>
                           <CardDescription>{stock.description}</CardDescription>
                        </StockCard>
                     ))}
                  </StockCardGrid>
               </PopularStocksSection>
            )}
         </AnimatePresence>

         <BackgroundGradient />
      </HomeContainer>
   )
}

const LoadingBar = styled(motion.div)`
   width: 100%;
   height: 4px;
   background: ${({ theme }) => theme.colors.primary};
`

const HomeContainer = styled(motion.div)`
   position: relative;
   min-height: calc(100vh - 80px);
   padding: ${({ theme }) => theme.spacing.xl};
   overflow: hidden;
`

const SearchSection = styled(motion.div)`
   position: relative;
   z-index: 1;
   max-width: 800px;
   margin: 0 auto ${({ theme }) => theme.spacing.xl};
`

const WelcomeSection = styled.div`
   text-align: center;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
   font-size: 3rem;
   font-weight: bold;
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.md};
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${({ theme }) => theme.spacing.sm};
`

const TitleIcon = styled.span`
   font-size: 3rem;
   display: inline-block;
   animation: float 3s ease-in-out infinite;

   @keyframes float {
      0% {
         transform: translateY(0px);
      }
      50% {
         transform: translateY(-5px);
      }
      100% {
         transform: translateY(0px);
      }
   }
`

const Subtitle = styled.p`
   font-size: 1.2rem;
   color: ${({ theme }) => theme.colors.textSecondary};
   max-width: 600px;
   margin: 0 auto;
   line-height: 1.6;
`

const ContentSection = styled(motion.div)`
   position: relative;
   z-index: 1;
`

const PopularStocksSection = styled(motion.div)`
   position: relative;
   z-index: 1;
   max-width: 1200px;
   margin: 0 auto;
   padding-top: ${({ theme }) => theme.spacing.xxl};
`

const SectionTitle = styled.h2`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   color: ${({ theme }) => theme.colors.text};
   text-align: center;
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const SectionSubtitle = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.textSecondary};
   text-align: center;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const StockCardGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
   gap: ${({ theme }) => theme.spacing.lg};
   padding: ${({ theme }) => theme.spacing.md};
`

const StockCard = styled(motion.div)`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.lg};
   cursor: pointer;
   border: 1px solid ${({ theme }) => theme.colors.border};
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      background: ${({ theme }) => theme.colors.surfaceLight};
      border-color: ${({ theme }) => theme.colors.primary};
   }
`

const CardCategory = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.xs};
   color: ${({ theme }) => theme.colors.primary};
   background: ${({ theme }) => `${theme.colors.primary}15`};
   padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
   border-radius: ${({ theme }) => theme.borderRadius.small};
   display: inline-block;
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const CardTitle = styled.h3`
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.xs};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`

const CardSymbol = styled.div`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const CardDescription = styled.p`
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   line-height: 1.5;
`

const BackgroundGradient = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: ${({ theme }) => `linear-gradient(
      135deg,
      ${theme.colors.primary}22 0%,
      ${theme.colors.secondary}22 100%
   )`};
   z-index: 0;
`

export default Home
