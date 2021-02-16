const { Op } = require("sequelize");

async function challenge(app, model) {
  async function getAllocatedPoints(userId) {
    const bets = await model.Bet.findAll({
      where: {
        [Op.or]: [{ challengeeId: userId }, { challengerId: userId }],
        winnerId: { [Op.is]: null },
      },
    });

    console.log(bets);

    let allocatedPoints = 0;

    for (const bet of bets) {
      allocatedPoints += bet.wager;
    }

    return allocatedPoints;
  }

  async function renderChallengeForm(req, res, challengeeId, error) {
    const challengees = await model.User.findAll({
      where: { id: { [Op.not]: req.user.id } },
    });

    res.render("challenge", {
      error,
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
  }

  app.get("/challenge", async (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    const challengeeId = parseInt(req.query.target, 10);

    await renderChallengeForm(req, res, challengeeId);
  });

  app.post("/challenge", async function (req, res) {
    if (!req.user) {
      return res.redirect("/login");
    }

    const challengee = await model.User.findOne({
      where: { id: req.body.challengee },
    });
    const wager = parseInt(req.body.wager, 10);

    const userAllocatedPoints = await getAllocatedPoints(req.user.id);
    if (wager > req.user.points - userAllocatedPoints) {
      return await renderChallengeForm(
        req,
        res,
        parseInt(req.body.challengee, 10),
        "You don't have enough points for that wager"
      );
    }

    const challengeeAllocatedPoints = await getAllocatedPoints(challengee.id);
    if (wager > challengee.points - challengeeAllocatedPoints) {
      return await renderChallengeForm(
        req,
        res,
        parseInt(req.body.challengee, 10),
        `${challengee.name} doesn't have enough points for that wager`
      );
    }

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
    const winnerId = parseInt(req.body.winner, 10);

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
