const Sequelize = require('sequelize')

module.exports = class Comment extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            content_text: {
               type: Sequelize.TEXT,
               allowNull: false,
            },
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
            modelName: 'Comment',
            tableName: 'comments',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      db.Comment.belongsTo(db.User)
      db.Comment.belongsTo(db.Post)
   }
}
