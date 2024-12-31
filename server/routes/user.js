const express = require('express')
const router = express.Router()
const { User, Activitie, Post, Like, Comment } = require('../models')

// 사용자 활동 업데이트
const updateUserActivity = async (userId, type) => {
   const user = await User.findOne({
      where: { id: userId },
      include: [Activitie],
   })

   if (!user) {
      throw new Error('User not found')
   }

   let activity = user.Activitie

   if (!activity) {
      activity = await Activitie.create({
         UserId: userId,
         posts_count: 0,
         likes_count: 0,
         comments_count: 0,
      })
   }

   // 각 타입별 카운트 업데이트
   switch (type) {
      case 'post':
         activity.posts_count = await Post.count({ where: { UserId: userId } })
         break
      case 'like':
         activity.likes_count = await Like.count({ where: { UserId: userId } })
         break
      case 'comment':
         activity.comments_count = await Comment.count({ where: { UserId: userId } })
         break
      default:
         throw new Error('Invalid activity type')
   }

   await activity.save()
   return activity
}

// 포스트 작성 시 활동 업데이트
router.post('/:userId/posts', async (req, res) => {
   const { userId } = req.params
   const { title, content, img } = req.body

   try {
      const post = await Post.create({ title, content, img, UserId: userId })
      await updateUserActivity(userId, 'post') // 활동 업데이트 호출

      return res.status(201).json({
         message: '포스트 작성 성공',
         post,
      })
   } catch (error) {
      console.error('포스트 작성 오류:', error)
      return res.status(500).json({
         message: '포스트 작성 중 오류 발생',
         error,
      })
   }
})

// 좋아요 시 활동 업데이트
router.post('/:userId/likes', async (req, res) => {
   const { userId } = req.params
   const { postId } = req.body

   try {
      const like = await Like.create({ UserId: userId, PostId: postId })
      await updateUserActivity(userId, 'like') // 활동 업데이트 호출

      // 좋아요 수 업데이트
      const activity = await Activitie.findOne({ where: { UserId: userId } })
      if (activity) {
         activity.likes_count = await Like.count({ where: { UserId: userId } })
         await activity.save()
      }

      return res.status(201).json({
         message: '좋아요 성공',
         like,
      })
   } catch (error) {
      console.error('좋아요 오류:', error)
      return res.status(500).json({
         message: '좋아요 중 오류 발생',
         error,
      })
   }
})

// 댓글 작성 시 활동 업데이트
router.post('/:userId/comments', async (req, res) => {
   const { userId } = req.params
   const { postId, content_text } = req.body

   try {
      const comment = await Comment.create({ content_text, UserId: userId, PostId: postId })
      await updateUserActivity(userId, 'comment') // 활동 업데이트 호출

      // 댓글 수 업데이트
      const activity = await Activitie.findOne({ where: { UserId: userId } })
      if (activity) {
         activity.comments_count = await Comment.count({ where: { UserId: userId } })
         await activity.save()
      }

      return res.status(201).json({
         message: '댓글 작성 성공',
         comment,
      })
   } catch (error) {
      console.error('댓글 작성 오류:', error)
      return res.status(500).json({
         message: '댓글 작성 중 오류 발생',
         error,
      })
   }
})

// 사용자 활동 조회
router.get('/:userId/activity', async (req, res) => {
   try {
      const userId = req.params.userId

      // 사용자 존재 여부 확인
      const user = await User.findOne({
         where: { id: userId },
      })

      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      // 각 활동 데이터 조회
      const [posts, likes, comments] = await Promise.all([Post.count({ where: { UserId: userId } }), Like.count({ where: { UserId: userId } }), Comment.count({ where: { UserId: userId } })])

      // 최근 활동 조회
      const recentActivities = await Promise.all([
         // 최근 게시글
         Post.findAll({
            where: { UserId: userId },
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'title', 'createdAt'],
         }),
         // 최근 댓글
         Comment.findAll({
            where: { UserId: userId },
            limit: 5,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'content_text', 'created_at'],
            include: [
               {
                  model: Post,
                  attributes: ['id', 'title'],
               },
            ],
         }),
         // 최근 좋아요
         Like.findAll({
            where: { UserId: userId },
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
               {
                  model: Post,
                  attributes: ['id', 'title'],
               },
            ],
         }),
      ])

      const [recentPosts, recentComments, recentLikes] = recentActivities

      // 활동 데이터 포맷팅
      const formattedActivities = [
         ...recentPosts.map((post) => ({
            type: 'POST_WRITE',
            id: post.id,
            title: post.title,
            createdAt: post.createdAt,
         })),
         ...recentComments.map((comment) => ({
            type: 'COMMENT_WRITE',
            id: comment.id,
            content: comment.content_text,
            postId: comment.Post?.id,
            postTitle: comment.Post?.title,
            createdAt: comment.createdAt,
         })),
         ...recentLikes.map((like) => ({
            type: 'POST_LIKE',
            id: like.id,
            postId: like.Post?.id,
            postTitle: like.Post?.title,
            createdAt: like.createdAt,
         })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      // 응답 데이터 구성
      const responseData = {
         posts_count: posts,
         likes_count: likes,
         comments_count: comments,
         recentActivities: formattedActivities,
      }

      res.json(responseData)
   } catch (error) {
      console.error('사용자 활동 조회 오류:', error)
      res.status(500).json({
         message: '사용자 활동 조회 중 오류가 발생했습니다.',
         error: error.message,
      })
   }
})

module.exports = router
