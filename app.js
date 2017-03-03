const express         = require('express');
const path            = require('path');
const favicon         = require('serve-favicon');
const logger          = require('morgan');
const cookieParser    = require('cookie-parser');
const bodyParser      = require('body-parser');
const layouts         = require('express-ejs-layouts');
const mongoose        = require('mongoose');
const passport        = require('passport');
const LocalStrategy   = require('passport-local').Strategy;
const FbStrategy      = require('passport-facebook').Strategy;
const GoogleStrategy  = require('passport-google-oauth').OAuth2Strategy;
const session         = require('express-session');
const bcrypt          = require('bcrypt');
const User            = require('./models/user-model.js');
const flash           = require('connect-flash');
require('dotenv').config();


mongoose.connect('mongodb://localhost/passport-app');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session({
  secret: 'this is the local passport strategy application secret',
  resave: true,
  saveUninitialized: true,
}));
//Creates new flash property
//Flash allows for giving users short-term alerts and success notifications, especially related to authentication
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Reduce information that needs to be stored in the database by using serialized and deserialized session information
  //This only stores unique information (usually user ID) in the session database
  //Below example only saves the _id of the user
// passport.serializeUser((user, cb) => {
//   cb(null, user._id);
// });

//Deserialized allows Passport to lookup user information from thier ID (stored with serialezeUser method)
// passport.deserializeUser((id, cb) => {
//   User.findOne({ "_id": id }, (err, user) => {
//     if (err) { return cb(err); }
//     cb(null, user);
//   });
// });



passport.use(new LocalStrategy((username, password, next) => { //this 'next' is from the passport module
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) { //if there is an existing username, error thrown
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.encryptedPassword)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));

//Facebook Passport Strategy
//This solution does not save Facebook details in the local session database
// passport.use(new FbStrategy({
// clientID: '',
// clientSecret: '',
// callbackURL: process.env.HOST_ADDRESS + '/auth/facebook/callback'
// }, (accessToken, refreshToken, profile, done) => {
//   done(null, profile);
// }));
passport.use(new GoogleStrategy({
clientID: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
callbackURL: process.env.GOOGLE_HOST + '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));



//Saves user information in the Sesssion Database
passport.serializeUser((user, cb) => {
  if (user.provider) {
    cb(null, user);
  } else {
  cb(null, user._id);
  }
});


//Deserialized user is how to get additonal details (if needed) and save it to the sessions database
passport.deserializeUser((id, cb) => {
  if(id.provider) {
    cb(null, id);
    return;
  } else {
  User.findOne({ '_id': id }, (err, user) => {
    if (err) {return cb(err); }
    cb(null, user);
  });
  }
});

// ---------------_ROUTES GO HERE ---------------
const index           = require('./routes/index');
const authRoutes      = require('./routes/auth-routes.js');
const protRoutes      = require('./routes/protected-routes.js');
const roomRoutes      = require('./routes/rooms-routes.js');
app.use('/', index);
app.use('/', authRoutes);
app.use('/', protRoutes);
app.use('/', roomRoutes);

// --------------------------------------------

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
