const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_now',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret_for_now',
    callbackURL: "/users/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find if user already exists
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }
      
      // If we don't have a user with that googleId, we check the email
      if (profile.emails && profile.emails.length > 0) {
        user = await User.findOne({ email: profile.emails[0].value });
      }

      // If user exists by email, link google account
      if (user) {
        user.googleId = profile.id;
        user.authProvider = 'google';
        if (profile.photos && profile.photos.length > 0) {
           user.avatar = profile.photos[0].value;
        }
        await user.save();
        return done(null, user);
      }

      // If entirely new, create the user
      const newUser = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        authProvider: 'google',
        avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
      });

      return done(null, newUser);
    } catch (error) {
      console.log('Error in Google Strategy:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
