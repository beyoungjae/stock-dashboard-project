import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import PostForm from '../../components/Posts/PostForm'

const WritePost = () => {
   const { user } = useSelector((state) => state.auth)

   if (!user) {
      return <Navigate to="/login" replace />
   }

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         <PostForm />
      </Container>
   )
}

const Container = styled(motion.div)`
   max-width: 1200px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

export default WritePost
