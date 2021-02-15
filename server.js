const home = require("./controllers/home");
const exphbs = require("express-handlebars");
const express = require("express");
const createModel = require("./model");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const auth = require("./controllers/auth");
const challenge = require("./controllers/challenge");
const user = require("./controllers/user");

const app = express();

// Handlebars setup
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// Express body/cookie handling setup
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Express session setup
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: new FileStore({}),
  })
);

async function init() {
  const model = await createModel();

  app.use(express.static("public"));

  // Setup controllers
  auth(app, model);
  home(app, model);
  challenge(app, model);
  user(app, model);

  app.listen(8080, () => {
    console.log("Server running at http://localhost:8080");
  });
}

init();
