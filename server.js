const express=require('express');
const app =express();
const path=require('path');
const cookieParser=require('cookie-parser');
const cors=require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

app.set("view engine",'ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

const expressSession = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('./config/passport');
const userRoutes = require('./routes/userRoutes');

app.use(
    expressSession({
        resave: false,
        saveUninitialized: false,
        secret: process.env.JWT_SECRET || 'secret',
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Routes
const { isLoggedIn } = require('./middlewares/isLoggedIn');

app.get('/', isLoggedIn, (req, res) => {
    res.render('index', { user: req.user });
});

app.use('/users', userRoutes);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
