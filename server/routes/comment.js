const express = require('express')
const router = express.Router()
const { Comment, User } = require('../models')
const { isLoggedIn } = require('../middlewares')

// 댓글 작성
router.post('/:postId', isLoggedIn, async (req, res) => {
   try {
      const { content } = req.body
      const comment = await Comment.create({
         content_text: content,
         PostId: req.params.postId,
         UserId: req.user.id,
      })

      const fullComment = await Comment.findOne({
         where: { id: comment.id },
         attributes: ['id', 'content_text', 'created_at'],
         include: [
            {
               model: User,
               attributes: ['id', 'username'],
            },
         ],
      })

      res.status(201).json(fullComment)
   } catch (error) {
      console.error('댓글 작성 오류:', error)
      res.status(500).json({ error: '댓글 작성 중 오류가 발생했습니다.' })
   }
})

// 댓글 삭제
router.delete('/:commentId', isLoggedIn, async (req, res) => {
   try {
      const comment = await Comment.findOne({
         where: { id: req.params.commentId },
      })

      if (!comment) {
         return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' })
      }

      if (comment.UserId !== req.user.id) {
         return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다.' })
      }

      await comment.destroy()
      res.status(204).end()
   } catch (error) {
      console.error('댓글 삭제 오류:', error)
      res.status(500).json({ error: '댓글 삭제 중 오류가 발생했습니다.' })
   }
})

module.exports = router
