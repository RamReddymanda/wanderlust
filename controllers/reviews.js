const Listing = require('../models/Listing');
const Review = require('../models/review');
module.exports.createReview = async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash('success','Successfully created a new review');
    res.redirect(`/listings/${req.params.id}`);
};
module.exports.deleteReview= async(req,res)=>{
    const {id,reviewId}=req.params;
    // console.log(id,reviewId);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review');
    res.redirect(`/listings/${id}`);
}