const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary'); //no need to mention the index.js because node automatically looks for a index file
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground,  catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm); //this needs to before '/:id' otherwise new will be considered as id. ORDER MATTERS

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));



module.exports = router;