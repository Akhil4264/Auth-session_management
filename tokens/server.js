const express = require("express")
require("dotenv").config()
const session = require("express-session")
const path = require('path')
const cors = require('cors')
const mongoose = require('./database/conn')
const jwt = require('jsonwebtoken')
const user = require('./model/users.model')
const bcrypt = require('bcrypt')



const app = express()
port = process.env.PORT || 3000


app.use(express.static(path.join(__dirname ,'/public')))
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors({
    origin : "*"
}))

app.use(session({
    name : "user_sid",
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    cookie : {maxAge : 1000*60*60,sameSite:true,secure : false,httpOnly:true}
}))



const users = [
    {id : 1,email : 'benten@gmail.com',password : 'tenneyson'},
    {id : 2,email : 'naruto@gmail.com',password : 'hinata'},
    {id : 3,email : 'pikachu@gmail.com',password : 'pikapi'}
]


const redirectHome = (req,res,next) =>{
    if(req.session.userId){
        res.redirect('/home')
    }
    else{
        next()
    }
}

const redirectLogin = (req,res,next) => {
    console.log('checking for session ')
    if(!req.session.userId){
        res.redirect('/login')
    }
    else{
        next()
    }


}



app.get('/',redirectHome,(req,res)=>{

    res.sendFile(__dirname+'/views/index.html')    

})


app.get('/register',redirectHome,(req,res) => {
    res.sendFile(__dirname+'/views/register.html')
})


app.get('/login',redirectHome,(req,res) => {
    res.sendFile(__dirname+'/views/login.html')
})


app.get('/home',redirectLogin,(req,res)=>{
    console.log(req.user)
    res.sendFile(__dirname+'/views/home.html')
})



app.post("/login",redirectHome,async(req,res)=>{ 

    const query = {
        $or: [
          { username: req.body.email },
          { Email: req.body.email },
        ]
    };

    const loggeduser = await user.findOne(query)
    if(loggeduser){
        await bcrypt.compare(req.body.password,loggeduser.Password,(err,resp)=>{
            if(err) {
                return res.sendStatus(400)
            }
            if(resp){
                req.session.userId = loggeduser.id
                return res.sendStatus(200)
                
            }
            else{
                return res.sendStatus(401)
            } 
        })
        
    }
    else{
        return res.sendStatus(400)
    }
    
})


app.post("/register",redirectHome,async(req,res)=>{

    
    const checkaval_email = await user.findOne({Email : req.body.email});
    const checkaval_user = await user.findOne({username : req.body.username});
    const checkaval_mobile = await user.findOne({Mobile : req.body.mobile});

    if(checkaval_email){
        res.status(409).json("Email already exists");
    }
    else if(checkaval_user){
        res.status(409).json("username already exists");
    }
    else if(checkaval_mobile){
        res.status(409).json("Mobile number already exists");
    }
    else{
        try{
            const salt = await bcrypt.genSalt();
            const hashedPass = await bcrypt.hash(req.body.password,salt);
            const newUser = await new user({username : req.body.username , Email : req.body.email,Password : hashedPass,Mobile : req.body.mobile});
            await newUser.save();
            req.session.userId = newUser.id
            res.sendStatus(200)
            
        }
        catch(err){
            res.status(400).send(err);
        }
        
    }
   
    
})

app.post('/logout',redirectLogin,(req,res)=>{

    req.session.destroy(err => {
        if(err){
            return res.redirect('/home')
        }
        res.clearCookie('user_sid')
        res.redirect('/')
    })

})

app.listen(port,() => {
    console.log(`http://localhost:${port}`)
})

