function home(app, model) {
  app.get("/", async (req, res) => {
    console.log("GET /home");

    const users = await model.User.findAll();

    res.render("home", { users: users.map((user) => user.dataValues) });
  });
}

module.exports = home;
