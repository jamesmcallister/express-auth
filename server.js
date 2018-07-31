const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const app = express();
const pgp = require("pg-promise")();
const bcrypt = require("bcrypt");
const {
  DATABASE,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  EXPRESS_PORT,
  DATABASE_PORT
} = process.env;
// @ts-ignore
const db = pgp({
  host: "localhost",
  port: DATABASE_PORT,
  database: DATABASE,
  user: DATABASE_USERNAME,
  password: DATABASE_PASSWORD
});

function getUserByUsername(username) {
  return db
    .one(`SELECT * FROM users WHERE username = $1`, [username])
    .then(data => data)
    .catch(err => console.log({ error: err.message }));
}

function getUserById(id) {
  return db
    .one(`SELECT * FROM users WHERE id = $1`, [id])
    .then(data => data)
    .catch(err => console.log({ error: err.message }));
}

function hashingPasword(userPassword) {
  const SALT_ROUNDS = 5;
  return bcrypt
    .genSalt(SALT_ROUNDS)
    .then(salt => bcrypt.hash(userPassword, salt))
    .then(hashedPassword => {
      console.log({ hashedPassword });
      return hashedPassword;
    })
    .catch(err => console.log(err));
}

function comparePlainTextAndDbPassword(userPassword, HashedPasswordFromDb) {
  return bcrypt
    .compare(userPassword, HashedPasswordFromDb)
    .then(matches => {
      console.log({ matches });
      return matches;
    })
    .catch(err => console.log(err));
}

app.set("view engine", "hbs");
app.use("/static", express.static("static"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  require("express-session")({
    secret: "some random text #^*%!!", // used to generate session ids
    resave: false,
    saveUninitialized: false
  })
);

// serialise user into session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialise user from session
passport.deserializeUser((id, done) => {
  getUserById(id).then(user => done(null, user));
});

// configure passport to use local strategy
// that is use locally stored credentials
passport.use(
  new LocalStrategy((username, password, done) => {
    let _user;
    getUserByUsername(username)
      .then(user => {
        if (!user) return done(null, false);
        _user = user;
        return comparePlainTextAndDbPassword(password, user.password);
      })
      .then(passwordMatches => {
        if (!passwordMatches) return done(null, false);
        return done(null, _user);
      })

      .catch(err => done(err, false));
  })
);

// initialise passport and session
app.use(passport.initialize());
app.use(passport.session());

// middleware function to check user is logged in
function isLoggedIn(req, res, next) {
  if (req.user && req.user.id) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/", function(req, res) {
  res.render("index", {});
});

// login page
app.get("/login", function(req, res) {
  res.render("login", {});
});

// route to accept logins
app.post("/login", passport.authenticate("local", { session: true }), function(
  req,
  res
) {
  res.status(200).end();
});

app.get("/signup", function(req, res) {
  res.render("signup", {});
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  hashingPasword(password)
    .then(hashPassword =>
      db.none(
        `
    INSERT INTO users (username, password) 
    VALUES ($1, $2)
    `,
        [username, hashPassword]
      )
    )
    .then(() => res.status(200).end())
    .catch(err => console.log(err));
});

// profile page - only accessible to logged in users
app.get("/profile", isLoggedIn, function(req, res) {
  // send user info. It should strip password at this stage
  res.render("profile", { user: req.user });
});

// route to log out users
app.get("/logout", function(req, res) {
  // log user out and redirect them to home page
  req.logout();
  res.redirect("/");
});

app.listen(8080, function() {
  console.log("Listening on port 8080!");
});
