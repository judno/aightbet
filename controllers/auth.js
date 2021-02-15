const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

function auth(app, model) {
  // Setup passport for sessions
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    console.log("serializeUser", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await model.User.findOne({ where: { id } });
      console.log("deserializeUser", user.dataValues);

      done(null, user);
    } catch (e) {
      done(e);
    }
  });

  passport.use(
    new LocalStrategy(async function (username, password, done) {
      console.log("Trying to auth user");
      try {
        const user = await model.User.findOne({
          where: { name: username, password },
        });
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login?attemptfailed" }),
    function (req, res) {
      req.session.save(function () {
        res.redirect(`/user/${req.user.id}`);
      });
    }
  );
  app.post("/sign-up", async function (req, res) {
    // Create user in database
    const user = await model.User.create({
      name: req.body.username,
      password: req.body.password,
    });

    // Login the user
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      // Redirect them to home
      return res.redirect("/");
    });
  });

  app.get("/logout", (req, res) => {
    req.logout();

    req.session.destroy(function (err) {
      res.redirect("/");
    });
  });

  app.get("/login", async (req, res) => {
    res.render("login", {
      loggedIn: Boolean(req.user),
      failedLogin: req.query.hasOwnProperty("attemptfailed"),
    });
  });

  app.get("/sign-up", async (req, res) => {
    res.render("sign-up", { loggedIn: Boolean(req.user) });
  });
}

module.exports = auth;
