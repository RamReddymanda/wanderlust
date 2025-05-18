const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError=require('../utils/ExpressError');
const listingController=require('../controllers/listings');
const {isLoggedIn, isOwner,validateListing}=require('../middleware');
const multer = require('multer');
const { cloudinary, storage } = require('../cloudConfig.js');
const upload = multer({ storage: storage });

router
  .route('/')
    .get(wrapAsync(listingController.index))
    .post(
      isLoggedIn,
      upload.single('listing[image]'),
      validateListing,
      wrapAsync(listingController.createlisting)
    );
//new route
router.get('/new',isLoggedIn,(req,res)=>{
    console.log(req.user);
    
    // if(!req.isAuthenticated()){
    //     req.flash('error','You must be signed in to create a listing');
    //     return res.redirect('/user/login');
    // };
    res.render('listings/new.ejs');
});
router
  .route('/:id')
    .get(listingController.showListing)
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));


//Edit Route
router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(listingController.rendorEditListing));

module.exports=router;