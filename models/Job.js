const mongoose = require('mongoose')

const Schema = mongoose.Schema

const JobSchema = new Schema({
    createdBy : {type : mongoose.Types.ObjectId, ref : 'User',  required : true},
    title : {type : String, required : true},
    description : {type : String, required : true},
    category : {type : String, required : true},
    location : {type : String, required : true},
    salary : {type : Number, required : true},
    coverImage : {type : String, default : 'نجار.jpg'},
    status : {type : String, default : 'open'},
}, {timestamps : true})

const JobModel = mongoose.model('Job', JobSchema)

module.exports = JobModel