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

module.exports = mongoose.model('Commune',communeSchema);