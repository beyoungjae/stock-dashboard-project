const Sequelize = require('sequelize')

module.exports = class Like extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            id: {
               type: Sequelize.INTEGER,
               primaryKey: true,
               autoIncrement: true,
            },
            createdAt: {
               type: Sequelize.DATE,
               allowNull: false,
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
