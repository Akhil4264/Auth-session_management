const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/db')
.then(()=>{
    console.log("connection to the database has been established")
}).catch((err)=>{
    throw err;
})

module.exports = mongoose