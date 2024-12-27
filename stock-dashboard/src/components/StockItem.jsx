import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getQuote } from '../store/slices/stockSlice'
import { motion } from 'framer-motion'

const StockItem = ({ stock }) => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const { symbol, name, exchange } = stock

   // 주식 상세 페이지 이동
   const handleClick = () => {
      dispatch(getQuote(symbol))
      navigate(`/stock/${symbol}`)
   }

   return (
      <ItemCard onClick={handleClick} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4, boxShadow: (theme) => theme.shadows.glow }} transition={{ duration: 0.2 }}>
         <MainInfo>
            <SymbolSection>
               <Symbol>{symbol}</Symbol>
               <Exchange>{exchange}</Exchange>
            </SymbolSection>
            <CompanyName>{name}</CompanyName>
         </MainInfo>
         <Indicator />
      </ItemCard>
   )
}

const ItemCard = styled(motion.div)`
   position: relative;
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   padding: ${({ theme }) => theme.spacing.lg};
   cursor: pointer;
   border: 1px solid ${({ theme }) => theme.colors.border};
   transition: ${({ theme }) => theme.transitions.quick};
   overflow: hidden;

   &:hover {
      background: ${({ theme }) => theme.colors.surfaceLight};
      border-color: ${({ theme }) => theme.colors.primary};
   }
`

const MainInfo = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.sm};
`

const SymbolSection = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
`

const Symbol = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.xl};
   font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
   color: ${({ theme }) => theme.colors.text};
   letter-spacing: 0.5px;
`

const Exchange = styled.span`
   font-size: ${({ theme }) => theme.typography.fontSizes.xs};
   color: ${({ theme }) => theme.colors.textSecondary};
   text-transform: uppercase;
   letter-spacing: 1px;
   background: ${({ theme }) => theme.colors.background};
   padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
   border-radius: ${({ theme }) => theme.borderRadius.small};
`

const CompanyName = styled.div`
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`

const Indicator = styled.div`
   position: absolute;
   top: 0;
   left: 0;
   width: 3px;
   height: 100%;
   background: ${({ theme }) => theme.colors.primary};
   opacity: 0;
   transition: ${({ theme }) => theme.transitions.quick};

   ${ItemCard}:hover & {
      opacity: 1;
   }
`

export default StockItem
