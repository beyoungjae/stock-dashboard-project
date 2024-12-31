import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { createPost, updatePost } from '../store/slices/postSlice'

const PostForm = ({ initialData = null }) => {
   // 게시글 작성, 수정 폼
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const fileInputRef = useRef(null)
   const [formData, setFormData] = useState({
      title: '',
      content: '',
      img: null,
   })
   const [error, setError] = useState(null)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [previewImage, setPreviewImage] = useState(null)

   // 초기 데이터 설정
   useEffect(() => {
      if (initialData) {
         setFormData({
            title: initialData.title,
            content: initialData.content,
            img: initialData.img,
         })
         setPreviewImage(initialData.img)
      }
   }, [initialData])

   // 입력 필드 변경
   const handleChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }))
   }

   const handleImageChange = (e) => {
      // 이미지 변경
      const file = e.target.files[0]
      if (file) {
         if (file.size > 10 * 1024 * 1024) {
            // 이미지 크기 10MB 제한
            setError('이미지 크기는 10MB를 초과할 수 없습니다.')
            return
         }

         // 이미지 미리보기
         const reader = new FileReader()
         reader.onloadend = () => {
            setPreviewImage(reader.result)
         }
         reader.readAsDataURL(file)

         // 폼 데이터 업데이트
         setFormData((prev) => ({
            ...prev,
            img: file,
         }))
         // 이미지 제거
      } else {
         setPreviewImage(null)
         setFormData((prev) => ({
            ...prev,
            img: null,
         }))
      }
   }

   // 이미지 제거
   const handleImageRemove = () => {
      setPreviewImage(null)
      setFormData((prev) => ({
         ...prev,
         img: null,
      }))
      if (fileInputRef.current) {
         fileInputRef.current.value = ''
      }
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      if (!formData.title.trim() || !formData.content.trim()) {
         setError('제목과 내용을 모두 입력해주세요.')
         return
      }

      setIsSubmitting(true)
      setError(null)

      // 게시글 생성 또는 업데이트
      try {
         const postFormData = new FormData()
         postFormData.append('title', formData.title)
         postFormData.append('content', formData.content)
         if (formData.img instanceof File) {
            postFormData.append('img', formData.img)
         }

         if (initialData) {
            await dispatch(
               updatePost({
                  id: initialData.id,
                  ...formData,
               })
            ).unwrap()
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
      <Form onSubmit={handleSubmit}>
         <FormGroup>
            <Label htmlFor="title">제목</Label>
            <Input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="제목을 입력하세요" disabled={isSubmitting} />
         </FormGroup>

         <FormGroup>
            <Label htmlFor="content">내용</Label>
            <TextArea id="content" name="content" value={formData.content} onChange={handleChange} placeholder="내용을 입력하세요" disabled={isSubmitting} rows={10} />
         </FormGroup>

         <FormGroup>
            <Label htmlFor="img">이미지</Label>
            <ImageUploadContainer>
               <ImageUploadButton type="button" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                  이미지 선택
               </ImageUploadButton>
               <ImageInput ref={fileInputRef} type="file" id="img" name="img" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
               {previewImage && (
                  <PreviewContainer>
                     <PreviewImage src={previewImage} alt="미리보기" />
                     <RemoveImageButton type="button" onClick={handleImageRemove}>
                        ✕
                     </RemoveImageButton>
                  </PreviewContainer>
               )}
            </ImageUploadContainer>
         </FormGroup>

         {error && <ErrorMessage>{error}</ErrorMessage>}

         <SubmitButton type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {isSubmitting ? '저장 중...' : initialData ? '수정하기' : '작성하기'}
         </SubmitButton>
      </Form>
   )
}

const Form = styled.form`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.lg};
   max-width: 800px;
   margin: 0 auto;
`

const FormGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.sm};
`

const Label = styled.label`
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
   font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`

const Input = styled.input`
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text};
   transition: ${({ theme }) => theme.transitions.quick};

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ theme }) => theme.shadows.glow};
   }

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const TextArea = styled.textarea`
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text};
   resize: vertical;
   min-height: 200px;
   transition: ${({ theme }) => theme.transitions.quick};

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: ${({ theme }) => theme.shadows.glow};
   }

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const ImageUploadContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`

const ImageUploadButton = styled.button`
   padding: ${({ theme }) => theme.spacing.md};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   color: ${({ theme }) => theme.colors.text};
   background: ${({ theme }) => theme.colors.surfaceLight};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.surface};
   }

   &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
   }
`

const ImageInput = styled.input`
   display: none;
`

const PreviewContainer = styled.div`
   position: relative;
   width: 100%;
   max-width: 300px;
   margin-top: ${({ theme }) => theme.spacing.md};
`

const PreviewImage = styled.img`
   width: 100%;
   height: auto;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   border: 1px solid ${({ theme }) => theme.colors.border};
`

const RemoveImageButton = styled.button`
   position: absolute;
   top: ${({ theme }) => theme.spacing.xs};
   right: ${({ theme }) => theme.spacing.xs};
   width: 24px;
   height: 24px;
   border-radius: 50%;
   background: ${({ theme }) => theme.colors.error};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: ${({ theme }) => theme.typography.fontSizes.sm};
   transition: ${({ theme }) => theme.transitions.quick};

   &:hover {
      opacity: 0.9;
   }
`

const ErrorMessage = styled.div`
   color: ${({ theme }) => theme.colors.error};
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   text-align: center;
   padding: ${({ theme }) => theme.spacing.md};
   background: ${({ theme }) => `${theme.colors.error}15`};
   border-radius: ${({ theme }) => theme.borderRadius.medium};
`

const SubmitButton = styled(motion.button)`
   padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.primary};
   color: ${({ theme }) => theme.colors.surface};
   border: none;
   border-radius: ${({ theme }) => theme.borderRadius.medium};
   cursor: pointer;
   font-size: ${({ theme }) => theme.typography.fontSizes.md};
   width: 100%;
   transition: ${({ theme }) => theme.transitions.quick};
`

export default PostForm
