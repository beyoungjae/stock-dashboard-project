exports.isLoggedIn = (req, res, next) => {
   if (req.isAuthenticated()) {
      next()
   } else {
      res.status(403).json({ error: '로그인이 필요한 서비스입니다.' })
   }
}

exports.isNotLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
      next()
   } else {
      res.status(403).json({ error: '이미 로그인한 사용자입니다.' })
   }
}
