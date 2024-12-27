const Sequelize = require('sequelize')

module.exports = class Like extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            created_at: {
               type: Sequelize.DATE,
               allowNull: true,
               defaultValue: Sequelize.NOW,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Like',
            tableName: 'likes',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Like.belongsTo(db.User)
      db.Like.belongsTo(db.Post)
   }
}
