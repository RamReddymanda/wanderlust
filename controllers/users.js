const User = require('../models/user.js');
module.exports.renderSignupForm=(req,res)=>{
    res.render('users/signup');
};
module.exports.signup=async (req,res)=>{
    console.log(req.ip);
    
    try{
        const {email,username,password}=req.body;
        let newUser=new User({email,username});
        let registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
            req.login(registeredUser,(err)=>{
                if(err) return next(err);
                req.flash('success','Welcome to the WonderLust!');
                res.redirect('/listings');
            });
        // console.log(registeredUser)
       
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/signup');
    }
};
module.exports.renderLoginForm=(req,res)=>{
    res.render('users/login');
};
module.exports.login=async (req,res)=>{
   req.flash('success','Welcome back!');
   res.redirect(res.locals.redirectUrl || '/listings');
}
module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash('success','Goodbye!');
        res.redirect('/listings');
    });
}