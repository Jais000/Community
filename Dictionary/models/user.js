const mongoose = require('mongoose')
const Commune = require('C:/Users/Jais/OneDrive/Projects/Dictionary/models/commune.js')
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    communities: [{type: mongoose.Types.ObjectId, ref:"Commune"}], 
    pass: String
})
module.exports = mongoose.model('User', userSchema)