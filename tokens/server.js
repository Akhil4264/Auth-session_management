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

// 1



const users = [
    {id : 1,email : 'benten@gmail.com',password : 'tenneyson'},
    {id : 2,email : 'naruto@gmail.com',password : 'hinata'},
    {id : 3,email : 'pikachu@gmail.com',password : 'pikapi'}
]


const redirectHome = (req,res,next) =>{
    // const authHeader = req.headers['authorization']
    // const token = authHeader && authHeader.split(' ')[1]
    // if(token){
    //     jwt.verify(token,process.env.ACCESS_SECRET_TOKEN,(err,user)=>{
    //         if(err){
    //             next()
    //         }
    //         else{
    //             req.user = user
    //             res.status(200).redirect('/home')
    //         }

    //     })
    // }
    // else{
    //     next()
    // }
    next()
}

const redirectLogin = (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token){
        res.status(401).redirect('/login')
    }
    else{
        jwt.verify(token,process.env.ACCESS_SECRET_TOKEN,(err,user)=>{
            if(err){
                return res.status(403).redirect('/login')
            }
            else{
                req.user = user
                next()
            }

        })
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
    console.log('vachindhi')

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
                console.log('user verified')
                const user = {name : loggeduser.username , email : loggeduser.Email}
                const accessToken = jwt.sign(user,process.env.ACCESS_SECRET_TOKEN)
                console.log(accessToken)
                return res.send({'msg' : 'okay'})
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
            const user = {name : newUser.username}
            const acessToken = jwt.sign(user,process.env.ACCESS_SECRET_TOKEN)
            return res.status(200).json({accessToken : acessToken})
            
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

