const express         = require('express');
const ensure          = require('connect-ensure-login');  //Directs user back to page there were looking for when they had to login
const roomRoutes      = express.Router();
const Room            = require('../models/room-model.js');
const bcrypt          = require('bcrypt');
const multer          = require('multer');
const uploads         = multer({ dest: __dirname + '/../public/uploads/' });

roomRoutes.get('/rooms/new', ensure.ensureLoggedIn(), (req, res, next) => {
  res.render('rooms/new.ejs', {
    message: req.flash('success.')
  });
});

roomRoutes.post('/rooms', ensure.ensureLoggedIn(), uploads.single('picture'), (req, res, next) => {
  const filename      = req.file.filename;
  const newRoom       = new Room ({
    name:               req.body.name,
    desc:               req.body.desc,
    picture:            `/uploads/${filename}`,
    owner:              req.user._id   // <-- we add the user ID
  });

  newRoom.save ((err) => {
    if (err) { return next(err); }
    else {
      res.redirect('/rooms/new');
    }
  });
});

roomRoutes.get('/my-rooms', ensure.ensureLoggedIn(), (req, res, next) => {
  Room.find({ owner: req.user._id }, (err, myRooms) => {
    if(err){
      next(err);
      return;
    }
    console.log(req.user);
    res.render('rooms/index.ejs', {rooms: myRooms});
  });
});



module.exports        = roomRoutes;
