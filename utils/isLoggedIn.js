module.exports= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error','You must be signed in to do that');
        return res.redirect('/user/login');
    }
    next();
}