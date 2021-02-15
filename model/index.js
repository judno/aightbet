const { Sequelize } = require("sequelize");
const defineUser = require("./User");
const defineBet = require("./Bet");
const config = require("../config");

const sequelize = process.env.JAWSDB_URL
  ? new Sequelize(process.env.JAWSDB_URL)
  : new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
    });

async function getUserPosition(userId) {
  const [results] = await sequelize.query(`select count(1) as position
  from users
  where points > (select points from users where id = ${userId})`);

  return results[0].position + 1;
}

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
    getUserPosition,
  };
}
module.exports = createModel;
