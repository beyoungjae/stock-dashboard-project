const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Post, User, Like, Comment } = require('../models')
const { isLoggedIn } = require('../middlewares')
const Sequelize = require('sequelize')

// uploads 폴더가 존재하는지 확인하고, 없으면 생성
try {
   fs.readdirSync('uploads')
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads')
}

const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads')
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname)
         const ext = path.extname(decodedFileName)
         const basename = path.basename(decodedFileName, ext)
         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
   },
   fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (allowedTypes.includes(file.mimetype)) {
         cb(null, true)
      } else {
         cb(new Error('이미지 파일만 업로드 가능합니다.'), false)
      }
   },
})

// 게시글 작성
router.post('/', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      const post = await Post.create({
         title: req.body.title,
         content: req.body.content,
         img: req.file ? `/uploads/${req.file.filename}` : null,
         UserId: req.user.id,
      })

      const newPost = await Post.findOne({
         where: { id: post.id },
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
            {
               model: Like,
               attributes: ['UserId'],
            },
            {
               model: Comment,
               attributes: ['id'],
            },
         ],
      })

      res.status(201).json({
         success: true,
         post: newPost,
         message: '게시글이 성공적으로 작성되었습니다.',
      })
   } catch (error) {
      console.error('게시글 작성 오류:', error)
      res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' })
   }
})

// 게시글 목록 조회
router.get('/', async (req, res) => {
   try {
      const posts = await Post.findAll({
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
            {
               model: Like,
               attributes: ['UserId'],
            },
            {
               model: Comment,
               attributes: ['id'],
            },
         ],
         order: [['createdAt', 'DESC']],
      })

      res.json(posts)
   } catch (error) {
      console.error('게시글 목록 조회 오류:', error)
      res.status(500).json({ error: '게시글 목록을 불러오는 중 오류가 발생했습니다.' })
   }
})

// 인기 게시글 조회
router.get('/popular', async (req, res) => {
   try {
      const posts = await Post.findAll({
         attributes: {
            include: [
               [
                  Sequelize.literal(`(
                     SELECT COUNT(*)
                     FROM likes
                     WHERE likes.PostId = Post.id
                  )`),
                  'likeCount',
               ],
            ],
         },
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
            {
               model: Like,
               attributes: [], // 집계만 필요하므로 속성은 제외
            },
            {
               model: Comment,
               attributes: ['id'],
               required: false,
            },
         ],
         group: ['Post.id', 'User.id', 'Comments.id'],
         having: Sequelize.literal('likeCount > 0'),
         order: [[Sequelize.literal('likeCount'), 'DESC']],
         limit: 10,
         subQuery: false,
      })

      res.json(posts)
   } catch (error) {
      console.error('인기 게시글 조회 오류:', error)
      res.status(500).json({ error: '인기 게시글을 불러오는 중 오류가 발생했습니다.' })
   }
})

// 게시글 상세 조회
router.get('/:id', async (req, res) => {
   try {
      const post = await Post.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
            {
               model: Like,
               attributes: ['UserId', 'createdAt'],
            },
            {
               model: Comment,
               attributes: ['id', 'content_text', 'created_at'],
               include: [
                  {
                     model: User,
                     attributes: ['id', 'username'],
                  },
               ],
            },
         ],
      })

      if (!post) {
         return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
      }

      res.json(post)
   } catch (error) {
      console.error('게시글 상세 조회 오류:', error)
      res.status(500).json({ error: '게시글을 불러오는 중 오류가 발생했습니다.' })
   }
})

/* 
// 게시글 작성
router.post('/', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      const post = await Post.create({
         title: req.body.title,
         content: req.body.content,
         img: req.file ? `/uploads/${req.file.filename}` : null,
         UserId: req.user.id,
      })

      const newPost = await Post.findOne({
         where: { id: post.id },
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
            {
               model: Like,
               attributes: ['UserId'],
            },
            {
               model: Comment,
               attributes: ['id'],
            },
         ],
      })

      res.status(201).json({
         success: true,
         post: newPost,
         message: '게시글이 성공적으로 작성되었습니다.',
      })
   } catch (error) {
      console.error('게시글 작성 오류:', error)
      res.status(500).json({ error: '게시글 작성 중 오류가 발생했습니다.' })
   }
})
*/

// 게시글 수정
router.put('/:id', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id } })

      if (!post) {
         return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
      }

      if (post.UserId !== req.user.id) {
         return res.status(403).json({ error: '게시글을 수정할 권한이 없습니다.' })
      }

      const updateData = {
         title: req.body.title,
         content: req.body.content,
         img: req.file ? `/uploads/${req.file.filename}` : null,
         UserId: req.user.id,
      }

      await post.update(updateData)

      // 업데이트된 게시글의 전체 정보를 조회하여 반환
      const updatedPost = await Post.findOne({
         where: { id: post.id },
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
            {
               model: Like,
               attributes: ['UserId'],
            },
            {
               model: Comment,
               include: [
                  {
                     model: User,
                     attributes: ['id', 'username'],
                  },
               ],
            },
         ],
      })

      res.json({
         success: true,
         post: updatedPost,
         message: '게시글이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      console.error('게시글 수정 오류:', error)
      res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.' })
   }
})

// 게시글 삭제
router.delete('/:id', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id } })

      if (!post) {
         return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
      }

      if (post.UserId !== req.user.id) {
         return res.status(403).json({ error: '게시글을 삭제할 권한이 없습니다.' })
      }

      await post.destroy()
      res.status(204).end()
   } catch (error) {
      console.error('게시글 삭제 오류:', error)
      res.status(500).json({ error: '게시글 삭제 중 오류가 발생했습니다.' })
   }
})

// 게시글 좋아요
router.post('/:id/like', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id } })
      if (!post) {
         return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
      }

      await Like.findOrCreate({
         where: {
            PostId: post.id,
            UserId: req.user.id,
         },
      })

      // 좋아요 상태만 반환
      const likes = await Like.findAll({
         where: { PostId: post.id },
         attributes: ['UserId'],
      })

      res.json({
         liked: true,
         likes: likes.map((like) => like.UserId),
         likeCount: likes.length,
      })
   } catch (error) {
      console.error('좋아요 오류:', error)
      res.status(500).json({ error: '좋아요 처리 중 오류가 발생했습니다.' })
   }
})

// 게시글 좋아요 취소
router.delete('/:id/like', isLoggedIn, async (req, res) => {
   try {
      const post = await Post.findOne({ where: { id: req.params.id } })
      if (!post) {
         return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' })
      }

      // 삭제 전 로그 추가
      console.log(
         '삭제 전 Like 테이블 확인:',
         await Like.findAll({
            where: { PostId: post.id, UserId: req.user.id },
         })
      )

      await Like.destroy({
         where: {
            PostId: post.id,
            UserId: req.user.id,
         },
      })

      // 삭제 후 로그 추가
      console.log(
         '삭제 후 Like 테이블 확인:',
         await Like.findAll({
            where: { PostId: post.id, UserId: req.user.id },
         })
      )

      // 좋아요 상태만 반환
      const likes = await Like.findAll({
         where: { PostId: post.id },
         attributes: ['UserId'],
      })

      res.json({
         liked: false,
         likes: likes.map((like) => like.UserId),
         likeCount: likes.length,
      })
   } catch (error) {
      console.error('좋아요 취소 오류:', error)
      res.status(500).json({ error: '좋아요 취소 중 오류가 발생했습니다.' })
   }
})

module.exports = router
