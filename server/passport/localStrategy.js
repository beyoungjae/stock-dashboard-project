const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user')

module.exports = () => {
   passport.use(
      new LocalStrategy(
         {
            usernameField: 'email',
            passwordField: 'password',
         },
         async (email, password, done) => {
            try {
               const user = await User.findOne({ where: { email } })
               if (!user) {
                  return done(null, false, { reason: '존재하지 않는 이메일입니다.' })
               }
               const result = await bcrypt.compare(password, user.password)
               if (result) {
                  return done(null, user)
               }
               return done(null, false, { reason: '비밀번호가 틀립니다.' })
            } catch (error) {
               console.error(error)
               return done(error)
            }
         }
      )
   )
}
