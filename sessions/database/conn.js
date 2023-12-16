const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect(process.env.MONGO_DB)
.then(()=>{
    console.log("connection to the database has been established")
}).catch((err)=>{
    throw err;
})

module.exports = mongoose