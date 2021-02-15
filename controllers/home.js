const { Op } = require("sequelize");
const getStatus = require("./utils");

function getLast5(arr) {
  if (!arr) {
    return [];
  }

  return arr.slice(Math.max(arr.length - 5, 0));
}

function home(app, model) {
  app.get("/", async (req, res) => {
    console.log("GET /home");

    const users = await model.User.findAll({
      order: [["points", "DESC"]],
    });

    const bets = await model.Bet.findAll({
      where: { winnerId: { [Op.not]: null } },
    });
    const userStreaks = {};

    for (const bet of bets) {
      if (!userStreaks[bet.challengerId]) {
        userStreaks[bet.challengerId] = [];
      }
      if (!userStreaks[bet.challengeeId]) {
        userStreaks[bet.challengeeId] = [];
      }

      userStreaks[bet.challengerId].push(bet.challengerId === bet.winnerId);
      userStreaks[bet.challengeeId].push(bet.challengeeId === bet.winnerId);
    }

    const templateVars = {
      loggedIn: Boolean(req.user),
      users: users.map((user, index) => ({
        ...user.dataValues,
        status: getStatus(users.length, index + 1),
        // Get last 5 of streak
        streak: getLast5(userStreaks[user.id]),
      })),
    };

    res.render("home", templateVars);
  });
}

module.exports = home;
