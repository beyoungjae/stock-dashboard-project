import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const NotFound = () => {
   return (
      <Container>
         <Title>404</Title>
         <Message>페이지를 찾을 수 없습니다.</Message>
         <HomeLink to="/">홈으로 돌아가기</HomeLink>
      </Container>
   )
}

const Container = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   min-height: 100vh;
   padding: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h1`
   font-size: 6rem;
   color: ${({ theme }) => theme.colors.primary};
   margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Message = styled.p`
   font-size: 1.5rem;
   color: ${({ theme }) => theme.colors.textSecondary};
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const HomeLink = styled(Link)`
   padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
   background-color: ${({ theme }) => theme.colors.primary};
   color: white;
   border-radius: ${({ theme }) => theme.borderRadius.medium};

   &:hover {
      opacity: 0.9;
   }
`

export default NotFound
