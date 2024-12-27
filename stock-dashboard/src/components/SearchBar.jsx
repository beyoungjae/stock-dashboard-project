import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { searchStocks } from '../store/slices/stockSlice'
import SearchIcon from '@mui/icons-material/Search'

const SearchBar = () => {
   const dispatch = useDispatch()
   const [query, setQuery] = useState('')

   // 검색 기능
   const handleSearch = (e) => {
      e.preventDefault()
      if (query.trim()) {
         dispatch(searchStocks(query.trim()))
      }
   }

   // 검색 값 변경
   const handleChange = (e) => {
      setQuery(e.target.value)
   }

   return (
      <SearchForm onSubmit={handleSearch}>
         <SearchInput type="text" placeholder="주식 심볼 또는 회사명 검색..." value={query} onChange={handleChange} />
         <SearchButton type="submit">
            <SearchIcon />
         </SearchButton>
      </SearchForm>
   )
}

const SearchForm = styled.form`
   display: flex;
   align-items: center;
   width: 100%;
   max-width: 600px;
   margin: 0 auto;
   gap: ${({ theme }) => theme.spacing.sm};
`

const SearchInput = styled.input`
   flex: 1;
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   transition: ${({ theme }) => theme.transitions.quick};

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ theme }) => theme.shadows.glow};
   }

   &::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
   }
`

const SearchButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   padding: ${({ theme }) => theme.spacing.md};
   color: ${({ theme }) => theme.colors.text};
   background: ${({ theme }) => theme.colors.primary};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      background: ${({ theme }) => theme.colors.primaryHover};
   }

   svg {
      width: 20px;
      height: 20px;
   }
`

export default SearchBar
