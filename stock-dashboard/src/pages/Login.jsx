import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginUserThunk } from '../store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'

const Login = () => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const [formData, setFormData] = useState({
      email: '',
      password: '',
   })
   const [error, setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   // 입력 필드 변경 시 호출
   const handleChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))
   }

   // 로그인 시도 시 호출
   const handleSubmit = async (e) => {
      e.preventDefault()
      setError(null)
      setIsLoading(true)

      try {
         await dispatch(loginUserThunk(formData)).unwrap() // 로그인 요청
         navigate('/') // 홈 페이지로 이동
      } catch (error) {
         setError(error.message || '로그인에 실패했습니다.') // 에러 메시지 설정
         console.error('로그인 실패:', error)
      } finally {
         setIsLoading(false) // 로딩 상태 초기화
      }
   }

   return (
      <LoginContainer>
         <FormCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <FormHeader>
               <Title initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                  <WelcomeIcon>👋</WelcomeIcon>
                  로그인
               </Title>
               <Subtitle>주식 대시보드에 오신 것을 환영합니다</Subtitle>
            </FormHeader>

            <AnimatePresence mode="wait">
               {error && (
                  <ErrorMessage initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                     <ErrorIcon>⚠️</ErrorIcon>
                     {error}
                  </ErrorMessage>
               )}
            </AnimatePresence>

            <Form onSubmit={handleSubmit}>
               <InputGroup>
                  <Label>이메일</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일을 입력하세요" required autoComplete="username" />
               </InputGroup>

               <InputGroup>
                  <Label>비밀번호</Label>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호를 입력하세요" required autoComplete="current-password" />
               </InputGroup>

               <LoginButton type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {isLoading ? (
                     <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ⚡
                     </LoadingSpinner>
                  ) : (
                     '로그인'
                  )}
               </LoginButton>
            </Form>

            <SignupLink onClick={() => navigate('/signup')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
               계정이 없으신가요? 회원가입
            </SignupLink>
         </FormCard>
      </LoginContainer>
   )
}

const LoginContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   min-height: 100vh;
   padding: ${({ theme }) => theme.spacing.lg};
   background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.surface})`};
`

const FormCard = styled(motion.div)`
   width: 100%;
   max-width: 400px;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.large};
   box-shadow: ${({ theme }) => theme.shadows.large};
   backdrop-filter: blur(10px);
   border: 1px solid rgba(255, 255, 255, 0.1);
`

const FormHeader = styled.div`
   text-align: center;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Title = styled(motion.h1)`
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${({ theme }) => theme.spacing.sm};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const WelcomeIcon = styled.span`
   font-size: 2rem;
`

const Subtitle = styled.p`
   color: ${({ theme }) => theme.colors.textSecondary};
   font-size: 0.9rem;
`

const Form = styled.form`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.lg};
`

const InputGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xs};
`

const Label = styled.label`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
   color: ${({ theme }) => theme.colors.text};
   font-weight: 500;
`

const Input = styled.input`
   width: 100%;
   padding: ${({ theme }) => theme.spacing.md};
   border: 2px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   font-size: 1rem;
   background: ${({ theme }) => theme.colors.background};
   color: ${({ theme }) => theme.colors.text};
   transition: all 0.2s;

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
   }

   &::placeholder {
      color: ${({ theme }) => theme.colors.textSecondary};
   }
`

const LoginButton = styled(motion.button)`
   width: 100%;
   padding: ${({ theme }) => theme.spacing.md};
   background: ${({ theme }) => `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`};
   color: white;
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   font-size: 1rem;
   font-weight: 600;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: ${({ theme }) => theme.spacing.sm};

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const LoadingSpinner = styled(motion.span)`
   font-size: 1.2rem;
`

const SignupLink = styled(motion.div)`
   text-align: center;
   color: ${({ theme }) => theme.colors.primary};
   cursor: pointer;
   margin-top: ${({ theme }) => theme.spacing.lg};
   font-weight: 500;

   &:hover {
      text-decoration: underline;
   }
`

const ErrorMessage = styled(motion.div)`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
   color: ${({ theme }) => theme.colors.error};
   background: ${({ theme }) => `${theme.colors.error}11`};
   padding: ${({ theme }) => theme.spacing.md};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   margin-bottom: ${({ theme }) => theme.spacing.md};
   font-size: 0.9rem;
`

const ErrorIcon = styled.span`
   font-size: 1.2rem;
`

export default Login
