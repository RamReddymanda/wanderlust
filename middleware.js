const Listing = require('./models/Listing');
const Review = require('./models/review');
const {listingSchema,reviewSchema}=require('./schema.js');
const ExpressError=require('./utils/ExpressError');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl= req.originalUrl;
        req.flash('error', 'You must be signed in to do that');
        return res.redirect('/login');
    }
    next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
         res.locals.redirectUrl=req.session.redirectUrl;
        //  console.log(res.locals.redirectUrl );
    }
    next();
}

module.exports.isOwner= async(req,res,next)=>{   
  let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash('error','You dont have permission to updated listing');
        return res.redirect(`/listings/${id}`);  
    } 
    next();
};

module.exports.validateListing=(req,res,next)=>{
    let {error} =listingSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map(el=>el.message).join(',');
        // const msg=result.error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};
module.exports.validateReview=(req,res,next)=>{
    let {error} =reviewSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map(el=>el.message).join(',');
        // const msg=result.error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

module.exports.isReviewOwner= async(req,res,next)=>{   
  let {id,reviewId}=req.params;
    let review= await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currentUser._id)){
        req.flash('error','You dont have permission to this review');
        return res.redirect(`/listings/${id}`);  
    } 
    next();
};