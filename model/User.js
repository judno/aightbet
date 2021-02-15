const { DataTypes } = require("sequelize");

function defineBet(sequelize) {
  return sequelize.define(
    "User",
    {
      // Model attributes are defined here
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      // Other model options go here
    }
  );
}

module.exports = defineBet;
