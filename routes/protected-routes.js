const express                 = require('express');
const protRoutes              = express.Router();
const ensureLogin             = require('connect-ensure-login');


function needsLogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

//calls the needsLogin as part of getting the route.  If user session is not established, they are redirected to the login page
//if user tries to access the page directly
protRoutes.get('/secret', ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.send('Shhh, it is a secret');
});

module.exports =  protRoutes;
