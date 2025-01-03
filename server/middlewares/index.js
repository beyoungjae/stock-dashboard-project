// nodemon 개발 모드 버그로 인해 routes 폴더 내의 middlewares 파일을 인식하지 못하여, server 폴더 내의 middlewares 파일로 이동

exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      res.status(403).json({ success: false, message: '로그인이 필요합니다.' })
   }
}

exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      next()
   } else {
      res.status(403).json({ success: false, message: '이미 로그인이 된 상태입니다.' })
   }
}
