const Sequelize = require('sequelize')

module.exports = class Activitie extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            posts_count: {
               type: Sequelize.INTEGER,
               allowNull: true,
               defaultValue: 0,
            },
            likes_count: {
               type: Sequelize.INTEGER,
               allowNull: true,
               defaultValue: 0,
            },
            comments_count: {
               type: Sequelize.INTEGER,
               allowNull: true,
               defaultValue: 0,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Activitie',
            tableName: 'user_activities',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Activitie.belongsTo(db.User)
   }
}
