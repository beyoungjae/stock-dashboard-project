import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { registerUserThunk } from '../store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'

const Signup = () => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      nickname: '',
   })
   const [error, setError] = useState(null)
   const [isLoading, setIsLoading] = useState(false)

   // 입력 필드 변경
   const handleChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))

      // 이메일 필드가 변경될 때마다 유효성 검사
      if (name === 'email' && value && !isValidEmail(value)) {
         setError('올바른 이메일 형식이 아닙니다.')
      } else {
         setError(null)
      }

      // 비밀번호 확인 필드가 채워졌을 때 유효성 검사
      if (name === 'confirmPassword' && value && value !== formData.password) {
         setError('비밀번호가 일치하지 않습니다.')
      } else {
         setError(null)
      }
   }

   // 이메일 유효성 검사 함수 추가
   const isValidEmail = (email) => {
      // 이메일 정규식 패턴
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
      return emailPattern.test(email)
   }

   // 회원가입 전송
   const handleSubmit = async (e) => {
      e.preventDefault()
      setError(null)
      setIsLoading(true)

      // 기본 필드 검사
      if (!formData.email || !formData.password || !formData.nickname) {
         setError('모든 필드를 입력해주세요.')
         setIsLoading(false)
         return
      }

      // 이메일 유효성 검사 추가
      if (!isValidEmail(formData.email)) {
         setError('올바른 이메일 형식이 아닙니다.')
         setIsLoading(false)
         return
      }

      // 비밀번호 확인 검사
      if (formData.password !== formData.confirmPassword) {
         setError('비밀번호가 일치하지 않습니다.')
         setIsLoading(false)
         return
      }

      try {
         await dispatch(
            registerUserThunk({
               email: formData.email,
               password: formData.password,
               nickname: formData.nickname,
            })
         ).unwrap()
         navigate('/login')
         window.location.reload()
      } catch (error) {
         setError(error.message || '회원가입에 실패했습니다.')
         console.error('회원가입 실패:', error)
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <SignupContainer>
         <FormCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <FormHeader>
               <Title initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                  회원가입
               </Title>
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
                  <Label>닉네임</Label>
                  <Input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="닉네임을 입력하세요" required autoComplete="nickname" />
               </InputGroup>

               <InputGroup>
                  <Label>비밀번호</Label>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호를 입력하세요" required autoComplete="new-password" />
               </InputGroup>

               <InputGroup>
                  <Label>비밀번호 확인</Label>
                  <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="비밀번호를 확인해주세요" required autoComplete="new-password" />
               </InputGroup>

               <SignupButton type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {isLoading ? (
                     <LoadingSpinner animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ⚡
                     </LoadingSpinner>
                  ) : (
                     '회원가입'
                  )}
               </SignupButton>
            </Form>

            <LoginLink onClick={() => navigate('/login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
               이미 계정이 있으신가요? 로그인
            </LoginLink>
         </FormCard>
         <BackgroundGradient />
      </SignupContainer>
   )
}

const SignupContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   min-height: 100vh;
   padding: ${({ theme }) => theme.spacing.lg};
   position: relative;
   overflow: hidden;
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
   position: relative;
   z-index: 1;
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

const SignupButton = styled(motion.button)`
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

const LoginLink = styled(motion.div)`
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

const BackgroundGradient = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: ${({ theme }) => `linear-gradient(
      135deg,
      ${theme.colors.secondary}22 0%,
      ${theme.colors.primary}22 100%
   )`};
   z-index: 0;
`

export default Signup
