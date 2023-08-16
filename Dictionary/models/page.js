const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    images:{
        type:String,
        required:false
    },
    community: mongoose.SchemaTypes.ObjectId,
    user : mongoose.SchemaType.ObjectId 
    
})

module.exports = mongoose.model('Page',communeSchema);