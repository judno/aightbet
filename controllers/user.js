const { Op } = require("sequelize");
const getStatus = require("./utils");

function user(app, model) {
  app.get("/user/:id", async (req, res) => {
    console.log("GET /user/:id");

    const userId = parseInt(req.params.id, 10);
    const user = await model.User.findOne({ where: { id: userId } });
    const challenges = await model.Bet.findAll({
      include: ["challengee", "challenger", "winner"],
      where: {
        [Op.or]: [{ challengerId: userId }, { challengeeId: userId }],
      },
      order: [["updatedAt", "DESC"]],
    });

    const activeChallenges = [];
    const pastChallenges = [];

    for (const c of challenges) {
      if (c.winnerId) {
        pastChallenges.push({
          title: c.dataValues.title,
          wager: c.dataValues.wager,
          description: c.dataValues.description,
          won: c.winnerId === userId,
          vs:
            c.dataValues.challengeeId === userId
              ? c.dataValues.challenger.dataValues
              : c.dataValues.challengee.dataValues,
        });
      } else {
        activeChallenges.push({
          id: c.dataValues.id,
          title: c.dataValues.title,
          wager: c.dataValues.wager,
          description: c.dataValues.description,
          vs:
            c.dataValues.challengeeId === userId
              ? c.dataValues.challenger.dataValues
              : c.dataValues.challengee.dataValues,
        });
      }
    }

    const userPosition = await model.getUserPosition(user.id);
    const totalUsers = await model.User.count();
    // user
    const templateVars = {
      loggedIn: Boolean(req.user),
      isLoggedInUser: req.user ? userId === req.user.id : false,
      userId,
      name: user.name,
      points: user.points,
      status: getStatus(totalUsers, userPosition),
      pastChallenges,
      activeChallenges,
    };

    res.render("user", templateVars);
  });
}

module.exports = user;
