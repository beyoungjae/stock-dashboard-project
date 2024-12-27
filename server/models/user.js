const Sequelize = require('sequelize')

module.exports = class User extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            username: {
               type: Sequelize.STRING(100),
               allowNull: false,
               unique: true,
            },
            email: {
               type: Sequelize.STRING(255),
               allowNull: false,
               unique: true,
            },
            password: {
               type: Sequelize.STRING(255),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      // 1:1 관계
      db.User.hasOne(db.Activitie)
      // 1:N 관계
      db.User.hasMany(db.Post)
      db.User.hasMany(db.Comment)
      db.User.hasMany(db.Like)
   }
}
