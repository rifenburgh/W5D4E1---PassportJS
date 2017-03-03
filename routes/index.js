const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    //Displays the Connect-Flash message created right before the page was rendered
    successMessage: req.flash('successMessage'),
    //Used to display logged in user details
    userInfo: req.user
  });
});

module.exports = router;
