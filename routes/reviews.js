const express = require('express');
const router = express.Router({mergeParams:true}); 
/*
In app.js we have the id passed as the params but express routers like
to keep params separate...Routers get separate params and they are kept 
separate...
So the id in the app.js passed in the app.js will not be passed here.
So in we use the option mergeParams=true to have the access.
*/
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;