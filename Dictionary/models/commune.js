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
    users: [mongoose.SchemaTypes.ObjectId],
    redirect: String, 
    events: [
        {name: String, 
        time : {type: Date, default:Date.now},
        location: [String],
        misc: []
        }
    ] 
    
})

module.exports = mongoose.model('Commune',communeSchema);