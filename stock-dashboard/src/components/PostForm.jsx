import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { createPost, updatePost } from '../store/slices/postSlice'

const PostForm = ({ initialData = null }) => {
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const [formData, setFormData] = useState({
      title: '',
      content: '',
   })
   const [error, setError] = useState(null)
   const [isSubmitting, setIsSubmitting] = useState(false)

   useEffect(() => {
      if (initialData) {
         setFormData({
            title: initialData.title,
            content: initialData.content,
         })
      }
   }, [initialData])

   const handleChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      if (!formData.title.trim() || !formData.content.trim()) {
         setError('제목과 내용을 모두 입력해주세요.')
         return
      }

      setIsSubmitting(true)
      setError(null)

      try {
         if (initialData) {
            await dispatch(updatePost({ postId: initialData.id, postData: formData })).unwrap()
         } else {
            await dispatch(createPost(formData)).unwrap()
         }
         navigate('/posts')
      } catch (error) {
         setError(error.message || '게시글 저장 중 오류가 발생했습니다.')
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <Container initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
         <Form onSubmit={handleSubmit}>
            <Title>{initialData ? '게시글 수정' : '새 게시글 작성'}</Title>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <FormGroup>
               <Label htmlFor="title">제목</Label>
               <Input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="제목을 입력하세요" disabled={isSubmitting} />
            </FormGroup>

            <FormGroup>
               <Label htmlFor="content">내용</Label>
               <TextArea id="content" name="content" value={formData.content} onChange={handleChange} placeholder="내용을 입력하세요" disabled={isSubmitting} />
            </FormGroup>

            <ButtonGroup>
               <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '저장 중...' : initialData ? '수정하기' : '작성하기'}
               </SubmitButton>
               <CancelButton type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>
                  취소
               </CancelButton>
            </ButtonGroup>
         </Form>
      </Container>
   )
}

const Container = styled(motion.div)`
   max-width: 800px;
   margin: 0 auto;
   padding: ${({ theme }) => theme.spacing.xl};
`

const Form = styled.form`
   background: ${({ theme }) => theme.colors.surface};
   padding: ${({ theme }) => theme.spacing.xl};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   border: 1px solid ${({ theme }) => theme.colors.border};
`

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.fontSizes.xxl};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.xl};
   text-align: center;
`

const FormGroup = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Label = styled.label`
   display: block;
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Input = styled.input`
   width: 100%;
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   background: ${({ theme }) => theme.colors.background};
   color: ${({ theme }) => theme.colors.text};
   transition: ${({ theme }) => theme.transitions.quick};

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
   }

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const TextArea = styled.textarea`
   width: 100%;
   min-height: 300px;
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   background: ${({ theme }) => theme.colors.background};
   color: ${({ theme }) => theme.colors.text};
   resize: vertical;
   transition: ${({ theme }) => theme.transitions.quick};

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
   }

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const ButtonGroup = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.md};
   margin-top: ${({ theme }) => theme.spacing.xl};
`

const Button = styled.button`
   flex: 1;
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const SubmitButton = styled(Button)`
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};

   &:not(:disabled):hover {
      opacity: 0.9;
   }
`

const CancelButton = styled(Button)`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   color: ${({ theme }) => theme.colors.text};

   &:not(:disabled):hover {
      background: ${({ theme }) => theme.colors.background};
   }
`

const ErrorMessage = styled.div`
   padding: ${({ theme }) => theme.spacing.md};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
   background: ${({ theme }) => theme.colors.errorLight};
   color: ${({ theme }) => theme.colors.error};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   text-align: center;
`

export default PostForm
