const express    = require("express");
const authRoutes = express.Router();

// User model
const User       = require("../models/user-model.js");

// Bcrypt to encrypt passwords
const bcrypt     = require("bcrypt");

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup-view.ejs");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup-view.ejs", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup-view.ejs", { message: "The username already exists" });
      return;
    }

    const salt     = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: username,
      encryptedPassword: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup-view.ejs", { message: "Something went wrong" });
      } else {
        //Uses Connect-Flash to display success message
        //successMessage is a variable, can be anything
        req.flash('successMessage', 'You have been registered.  Try logging in.');
        res.redirect("/");
      }
    });
  });
});
// New Code to support Passport implementation
const passport        = require('passport');

authRoutes.get('/login', (req, res, next) => {
  res.render('auth/login-view.ejs', {
    errorMessage: req.flash('error')
  });
});
authRoutes.post('/login',
  passport.authenticate('local', {
    //points the user to the page there were trying to get to originally (if that page redirected them to the login page)
    successReturnToOrRedirect: '/',
    // successRedirect: '/',
    failureRedirect: '/login',
    successFlash: 'Logged In Successfully',
    failureFlash: 'Login Failed',
    passReqToCallback: true
  })
);

authRoutes.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'YOu have successfully logged out.');
  res.redirect('/');
});
//Facebook Authentication
authRoutes.get('/auth/facebook', passport.authenticate('facebook'));
authRoutes.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

//Google Authentication
authRoutes.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/plus.profile.emails.read"]
}));

authRoutes.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/login",
  successRedirect: "/"
}));

module.exports = authRoutes;
