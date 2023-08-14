const mongoose = require('mongoose');

const communeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    address:{
        type:String,
        required:false
    },
    users: [mongoose.SchemaTypes.ObjectId]
})

const commune = module.exports = mongoose.model('commune',communeSchema);