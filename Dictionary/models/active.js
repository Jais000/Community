const mongoose = require('mongoose')
const Commune = require('C:/Users/Jais/OneDrive/Projects/Dictionary/models/commune.js')
const userSchema = new mongoose.Schema({
    user: {type:mongoose.SchemaTypes.ObjectId, ref:'User'}
})
module.exports = mongoose.model('Active', userSchema)