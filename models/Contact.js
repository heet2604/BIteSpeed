const mongoose = require('mongoose')

const ContactSchema = new mongoose.Schema({
    phoneNumber : String,
    email : String,
    linkedId : {
        type : mongoose.Schema.Types.ObjectId,
        ref:'Contact'
    },
    linkPrecedence : {
        type : String,
        enum : ['primary','secondary'],
        required : true
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    updatedAt : {
        type : Date,
        default : Date.now
    },
    deletedAt : {
        Date
    }
})

module.exports = mongoose.model('Contact',ContactSchema)