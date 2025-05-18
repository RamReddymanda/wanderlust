const Listing = require("../models/Listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index= async(req,res)=>{
  const allListing=await Listing.find();
  res.render("listings/index.ejs",{allListing})
};
module.exports.showListing=(req,res)=>{
    const {id}=req.params;
    console.log(res.locals.currentUser);
    let curuser=res.locals.currentUser;
    
     Listing.findById(id).populate({path: "reviews",populate:{path:"author"}}).populate("owner").then((listing)=>{
        // console.log(listing.image.url);
        if(!listing){
            req.flash('error','Listing not found');
            return res.redirect('/listings');
        }
        res.render('listings/show.ejs',{listing,curuser});
    }).catch(err=>console.log(err));
};
module.exports.createlisting= async(req,res,next)=>{
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send()

    let url=req.file.path;
    let filename=req.file.filename;
    
    const newListing= new Listing(req.body.listing);
    newListing.image={url,filename};
    newListing.owner=req.user._id;
    newListing.geometry= response.body.features[0].geometry;
    await newListing.save();
    req.flash('success','Successfully created a new listing');
    res.redirect('/listings');
};
module.exports.rendorEditListing= async(req,res)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
     if(!listing){
            req.flash('error','Listing not found');
            return res.redirect('/listings');
        }
    let orginalImage=listing.image.url;
    orginalImage= orginalImage.replace("/upload","/upload/w_250");
    res.render('listings/edit.ejs',{listing,orginalImage});
};
module.exports.updateListing= async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=='undefined'){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    
    req.flash('success','Successfully updated listing');
    res.redirect(`/listings/${id}`);  
    // res.send('Listing updated successfully'); 
};
module.exports.deleteListing= async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","deleted successfully")
    res.redirect('/listings');
}