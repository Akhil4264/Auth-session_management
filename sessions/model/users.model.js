const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        index : {
            unique : true
        }
    },
    Email :{
        type : String,
        required : true
    },
    Password : {
        type : String,
        required : true
    },
    Mobile : {
        type : Number,
        required : true,
    }
},{timestamps : true});

const user = mongoose.model('user',userSchema);

module.exports = user;