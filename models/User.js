const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    name : {type : String, required : false},
    phone : {type : String, required : true, unique : true},
    email : {type : String, required : false},
    password : {type : String, required : true},
    profileImage : {type : String, required : false},
    role : {type : String, required : false},
    isActive : {type : Boolean},
    skills : String,
    expereinceYear : {type : Number, required : false},
    about : {type : String, required : false},
    province : {type : String, required : false},
    rate : {type : Number, default : 5},
    job : {type : String, required : false},
    district : {type : String, required : false},
    gallery : [{type : String, required : false}],
}, {timestamps : true})

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel