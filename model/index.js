const { Sequelize } = require("sequelize");
const defineUser = require("./User");
const defineBet = require("./Bet");

const sequelize = new Sequelize("aightbet", "root", "mysql", {
  host: "localhost",
  dialect: "mysql",
});

async function createModel() {
  const User = defineUser(sequelize);
  const Bet = defineBet(sequelize);

  const Challenger = (Bet.Challenger = Bet.belongsTo(User, {
    as: "challenger",
  }));
  const Challengee = (Bet.Challengee = Bet.belongsTo(User, {
    as: "challengee",
  }));
  const Winner = (Bet.Winner = Bet.belongsTo(User, { as: "winner" }));

  await sequelize.authenticate();
  console.log("Connection has been established successfully.");

  await sequelize.sync({ alter: true });

  return {
    User,
    Bet,
    Challengee,
    Challenger,
    Winner,
  };
}
module.exports = createModel;
