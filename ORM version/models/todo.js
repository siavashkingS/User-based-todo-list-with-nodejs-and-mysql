module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Todo', {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },{
        timestamps: false
    });
  };