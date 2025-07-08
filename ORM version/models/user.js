module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },{
        timestamps: false
    });
  };