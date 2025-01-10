import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import StockItem from './StockItem'
import { selectSearchResults, selectStatus, selectErrors } from '../../store/slices/stockSlice'

const StockList = () => {
   const searchResults = useSelector(selectSearchResults)
   const status = useSelector(selectStatus)
   const errors = useSelector(selectErrors)

   // 검색이 시작되지 않았을 때는 아무것도 표시하지 않음
   if (status.search === 'idle') {
      return null
   }

   // 로딩 상태 체크
   if (status.search === 'loading') {
      return (
         <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingMessage>검색 중...</LoadingMessage>
         </Container>
      )
   }

   // 에러 상태 체크
   if (errors.search) {
      return (
         <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ErrorMessage>{errors.search}</ErrorMessage>
         </Container>
      )
   }

   // 검색 결과가 있을 때
   if (Array.isArray(searchResults) && searchResults.length > 0) {
      return (
         <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ListContainer>
               {searchResults.map((stock, index) => {
                  // symbol이나 exchange가 없는 경우 index를 포함한 고유한 키 생성
                  const key = stock.symbol && stock.exchange ? `${stock.symbol}-${stock.exchange}` : `stock-${index}`
                  return <StockItem key={key} stock={stock} />
               })}
            </ListContainer>
         </Container>
      )
   }

   // 검색 결과가 없을 때 (검색은 완료되었지만 결과가 없는 경우)
   if (status.search === 'succeeded') {
      return (
         <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyMessage>검색 결과가 없습니다.</EmptyMessage>
         </Container>
      )
   }

   return null
}

const Container = styled(motion.div)`
   width: 100%;
   background: ${({ theme }) => theme.colors.surface}CC;
   backdrop-filter: blur(10px);
   border-radius: ${({ theme }) => theme.borderRadius.large};
   border: 1px solid ${({ theme }) => theme.colors.border};
   margin-top: ${({ theme }) => theme.spacing.xl};
   overflow: hidden;
`

const ListContainer = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
   gap: ${({ theme }) => theme.spacing.lg};
   padding: ${({ theme }) => theme.spacing.xl};
`

const LoadingMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const ErrorMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

const EmptyMessage = styled.div`
   text-align: center;
   padding: ${({ theme }) => theme.spacing.xl};
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`

export default StockList
