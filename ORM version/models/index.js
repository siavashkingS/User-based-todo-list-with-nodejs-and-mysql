const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mydb', 'siavash', '13800831', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Todo = require('./todo')(sequelize, Sequelize);

// Define relationships
db.User.hasMany(db.Todo, { foreignKey: 'user_id' });
db.Todo.belongsTo(db.User, { foreignKey: 'user_id' });

module.exports = db;