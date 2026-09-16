const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ApplicationSchema = new Schema({
    job : {type : mongoose.Types.ObjectId, ref : 'Job',  required : true},
    worker : {type : mongoose.Types.ObjectId, ref : 'User',  required : true},
    status : {type : String, default : 'pending'}
}, {timestamps : true})

const ApplicationModel = mongoose.model('Applications', ApplicationSchema)

module.exports = ApplicationModel