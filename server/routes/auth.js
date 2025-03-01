const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../models/user')
const { isNotLoggedIn, isLoggedIn } = require('./middlewares')

// 회원가입
router.post('/join', async (req, res, next) => {
   const { email, password, nickname } = req.body
   try {
      const exUser = await User.findOne({ where: { email } })
      if (exUser) {
         return res.status(409).json({
            success: false,
            message: '이미 존재하는 사용자입니다.',
         })
      }

      const hash = await bcrypt.hash(password, 12)
      const newUser = await User.create({
         username: nickname,
         password: hash,
         email,
      })

      // 성공 응답 반환
      res.status(201).json({
         success: true,
         message: '사용자가 성공적으로 등록되었습니다.',
         user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
         },
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({
         success: false,
         message: '회원가입 중 오류가 발생했습니다.',
         error,
      })
   }
})

// 로그인
router.post('/login', isNotLoggedIn, async (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         return res.status(500).json({ success: false, message: '인증 중 오류 발생', error: authError })
      }
      if (!user) {
         return res.status(401).json({ success: false, message: info.message || '로그인 실패' })
      }
      req.login(user, (loginError) => {
         if (loginError) {
            return res.status(500).json({ success: false, message: '로그인 중 오류 발생', error: loginError })
         }
         res.json({
            success: true,
            message: '로그인 성공',
            user: {
               id: user.id,
               username: user.username,
               email: user.email,
            },
         })
      })
   })(req, res, next)
})

// 로그아웃
router.get('/logout', isLoggedIn, async (req, res, next) => {
   req.logout((err) => {
      if (err) {
         return res.status(500).json({ success: false, message: '로그아웃 중 오류 발생', error: err })
      }
      res.json({
         success: true,
         message: '로그아웃이 성공적으로 완료되었습니다.',
      })
   })
})

// 인증 상태 확인
router.get('/status', (req, res) => {
   if (req.isAuthenticated()) {
      res.json({
         isAuthenticated: true,
         user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
         },
      })
   } else {
      res.json({
         isAuthenticated: false,
      })
   }
})

module.exports = router
