if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const Campground = require('./models/campground');
const Review = require('./models/review');

const userRoutes= require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const dbUrl= 'mongodb://localhost:27017/yelp-camp'; // process.env.DB_URL

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'Connection Error:'));
db.once("open", () => {
    console.log("Database Connected!");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith:'_'
}));
app.use(helmet({contentSecurityPolicy: false}));

// const store = new MongoDBStore.create({
//     mongoUrl: dbUrl,
//     secret: 'secret',
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log('SESSION STORE ERROR', e);
// });

const sessionConfig = {
    store: MongoDBStore.create({
        mongoUrl: dbUrl,
        secret: 'secret',
        touchAfter: 24 * 60 * 60
    }),
    name: 'session',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, -> this is for https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //console.log(req.session);
    //console.log(req.params);
    res.locals.currentUser= req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (res, req, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Some Error';
    res.status(statusCode).render('error', {err});
});

app.listen(8080, () => {
    console.log('Serving on port 8080');
});