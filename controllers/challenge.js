const { Op } = require("sequelize");

function challenge(app, model) {
  app.get("/challenge", async (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    const challengeeId = parseInt(req.query.target, 10);

    const challengees = await model.User.findAll({
      where: { id: { [Op.not]: req.user.id } },
    });

    res.render("challenge", {
      loggedIn: Boolean(req.user),
      challengees: challengees
        .map((user) => user.dataValues)
        .sort((a, b) => {
          if (a.id === challengeeId) {
            return -1;
          }
          if (b.id === challengeeId) {
            return 1;
          }

          return 0;
        }),
    });
  });

  app.post("/challenge", async function (req, res) {
    //create a bet
    await model.Bet.create({
      title: req.body.title,
      wager: req.body.wager,
      description: req.body.description,
      challengeeId: req.body.challengee,
      challengerId: req.user.id,
    });

    res.redirect("/");
  });

  app.post("/challenge/:id", async function (req, res) {
    const challengeId = req.params.id;
    const winnerId = req.body.winner;

    // Get Bet and set winner
    const bet = await model.Bet.findOne({ where: { id: challengeId } });
    bet.winnerId = winnerId;

    // Find loserId
    const loserId =
      bet.challengerId === winnerId ? bet.challengeeId : bet.challengerId;

    // Get winner and loser User types
    const winner = await model.User.findOne({ where: { id: winnerId } });
    const loser = await model.User.findOne({ where: { id: loserId } });

    // Subtract wager from loser and add to winner
    winner.points += bet.wager;
    loser.points -= bet.wager;

    // Save winner, loser and bet to DB
    await winner.save();
    await loser.save();
    await bet.save();

    res.redirect(`/user/${winnerId}`);
  });
}

module.exports = challenge;
