const express = require('express');
const router = express.Router({mergeParams: true});
const Listing = require('../models/Listing');
const Review = require('../models/review');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError=require('../utils/ExpressError');
const {reviewSchema}=require('../schema.js');
const cookieparser = require('cookie-parser');
const reviewController=require('../controllers/reviews');
const {validateReview, isLoggedIn, isOwner, isReviewOwner}=require('../middleware');
router.use(cookieparser());
//reviews

//post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//delete review route
router.delete("/:reviewId",isLoggedIn,isReviewOwner,wrapAsync(reviewController.deleteReview));

module.exports = router;