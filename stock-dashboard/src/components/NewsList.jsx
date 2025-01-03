import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchStockNews, selectNews, selectNewsStatus, selectNewsError } from '../store/slices/stockSlice'

const NewsList = ({ symbol }) => {
   // 부모 컴포넌트에서 전달된 symbol 값을 사용하여 뉴스 데이터를 불러오기
   const dispatch = useDispatch()
   const news = useSelector(selectNews)
   const status = useSelector(selectNewsStatus)
   const error = useSelector(selectNewsError)

   useEffect(() => {
      if (symbol) {
         dispatch(fetchStockNews(symbol))
      }
   }, [symbol, dispatch])

   if (status === 'loading') {
      return <LoadingMessage>뉴스를 불러오는 중...</LoadingMessage>
   }

   if (status === 'failed') {
      return <ErrorMessage>{error?.details || error?.message || '뉴스를 불러오는데 실패했습니다.'}</ErrorMessage>
   }

   if (!news || news.length === 0) {
      return <NoNewsMessage>현재 제공되는 뉴스가 없습니다.</NoNewsMessage>
   }

   return (
      <NewsContainer>
         <AnimatePresence>
            {news.map((item, index) => (
               <NewsItem key={`${item.link}-${index}`} as={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: index * 0.1 }}>
                  <NewsLink href={item.link} target="_blank" rel="noopener noreferrer">
                     <NewsTitle>{item.title}</NewsTitle>
                     <NewsMetadata>
                        <Publisher>{item.publisher}</Publisher>
                        {item.publishedAt && (
                           <PublishDate>
                              {new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                                 // 뉴스 발행 날짜 포맷팅
                                 year: 'numeric', // 년도
                                 month: 'long', // 월
                                 day: 'numeric', // 일
                              })}
                           </PublishDate>
                        )}
                     </NewsMetadata>
                     {item.summary && <NewsSummary>{item.summary}</NewsSummary>}
                  </NewsLink>
               </NewsItem>
            ))}
         </AnimatePresence>
      </NewsContainer>
   )
}

const NewsContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const NewsItem = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   overflow: hidden;
   transition: transform 0.2s ease;

   &:hover {
      transform: translateY(-2px);
   }
`

const NewsLink = styled.a`
   display: block;
   padding: ${({ theme }) => theme.spacing.lg};
   text-decoration: none;
   color: inherit;
`

const NewsTitle = styled.h4`
   margin: 0 0 ${({ theme }) => theme.spacing.sm};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`

const NewsMetadata = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const Publisher = styled.span`
   font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`

const PublishDate = styled.span`
   &::before {
      content: '•';
      margin: 0 ${({ theme }) => theme.spacing.xs};
   }
`

const NewsSummary = styled.p`
   margin: 0;
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   color: ${({ theme }) => theme.colors.textSecondary};
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
   overflow: hidden;
`

const LoadingMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
`

const ErrorMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.error};
`

const NoNewsMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
`

export default NewsList
