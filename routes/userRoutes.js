const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login } = require('../controllers/authController');
const { generateToken } = require('../utils/generateToken');

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/users/login', failureFlash: "Google sign-in failed" }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    req.flash('success', 'Logged in with Google successfully!');
    res.redirect('/'); 
  }
);

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', register);
router.post('/login', login);

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/users/login');
});

module.exports = router;
