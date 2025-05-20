if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express=require('express');
const app=express();
const  mongoose = require('mongoose');
// const MONGO_URI = 'mongodb://127.0.0.1:27017/wonderlust';
const MONGO_URI=process.env.ATLASDB_URI;
const path =require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError=require('./utils/ExpressError');
const listingRouter=require('./routes/listing');
const reviewRouter=require('./routes/review');
const userRouter=require('./routes/user');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const wrapAsync = require('./utils/wrapAsync');
const listingController=require('./controllers/listings');
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

const store=MongoStore.create({
    mongoUrl:MONGO_URI,
    touchAfter:24*3600,
    crypto:{
        secret:process.env.SECRET,
    }   
});
store.on('error',function(e){
    console.log('Session store error',e);       
});


const sessionOptions={
    store,
    secret:'thisshouldbeasecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user;
   
    next();
});
async function main(){
    await mongoose.connect(MONGO_URI);
};
main().then(()=>{
    console.log('Connected to the database');
}).catch(err=>console.log(err));


// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let registeredUser=await User.register(fakeUser,"password")
//     res.send(registeredUser);
// });

app.use('/listings/:id/reviews',reviewRouter);
app.use('/listings',listingRouter);

app.use('/',userRouter);
app.get('/',wrapAsync(listingController.index));
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,'Page not found'));
    // res.send('Page not found');
});
app.use((err,req,res,next)=>{
    // let {statusCode,message} = err;
    // res.status(statusCode).send(message);
    // console.log(err);
    const {statusCode=500,message='Something went wrong'}=err;
    res.status(statusCode).render("error",{message});
});
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});


// app.get("/testListing",(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"A beautiful villa in the heart of the city",
//         price:5000,
//         location:"Calangute,Gao",
//         country:"India"
//     });
//     sampleListing.save().then((listing)=>{
//         console.log(listing);     
//     }).catch(err=>console.log(err));   
//         res.send("listing created");
    
// })