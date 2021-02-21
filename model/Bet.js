const { DataTypes } = require("sequelize");
//bet features
function defineBet(sequelize) {
  return sequelize.define("Bet", {
    // Model attributes are defined here
    wager: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  });
}
module.exports = defineBet;
