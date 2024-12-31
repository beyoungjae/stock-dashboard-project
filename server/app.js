const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
require('dotenv').config()
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const passport = require('passport')
const passportConfig = require('./passport')
const session = require('express-session')

// 라우터 및 모듈 불러오기
const { sequelize } = require('./models')
const userRouter = require('./routes/user')
const postRouter = require('./routes/post')
const authRouter = require('./routes/auth')
const pageRouter = require('./routes/page')
const stockRouter = require('./routes/stock')
const commentRouter = require('./routes/comment')

const app = express()
passportConfig()
app.set('port', process.env.PORT || 8000)

// 시퀄라이즈로 DB연결
sequelize
   .sync({ force: false })
   .then(() => {
      console.log('데이터베이스 테이블 생성 및 연결 완료')
   })
   .catch((err) => {
      console.error(err)
   })

// 미들웨어 설정 및 포트 설정
app.use(
   cors({
      origin: 'http://localhost:3000',
      credentials: true,
   })
)

// 레이트 리밋 설정
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15분
   max: 100, // 15분에 최대 100번 요청
   message: '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.',
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/stock', limiter)
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET))

// 세션 설정 강화
app.use(
   session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
         httpOnly: true,
         secure: false,
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      },
      name: 'stock.sid', // 세션 쿠키명 변경
   })
)

// 패스포트 설정
app.use(passport.initialize())
app.use(passport.session())

// 라우터 등록
app.use('/user', userRouter)
app.use('/posts', postRouter)
app.use('/auth', authRouter)
app.use('/page', pageRouter)
app.use('/stock', stockRouter)
app.use('/comment', commentRouter)

// 잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
   error.status = 404
   next(error)
})

// 에러 미들웨어
app.use((err, req, res, next) => {
   console.error(err)
   res.status(err.status || 500).json({
      message: err.message || '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? err : {},
   })
})

app.options('*', cors())
app.listen(app.get('port'), () => {
   console.log(`${app.get('port')}번 포트에서 대기 중`)
})
