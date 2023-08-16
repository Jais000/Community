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
    users: [{type : mongoose.SchemaTypes.ObjectId, ref: 'User'}],
    redirect: {type:String, required:true}, 
    events: [
        {name: String, 
        time : {type: String, default:Date.now},
        location: String,
        misc: []
        }
        ] ,
    admins: [
        {type: mongoose.SchemaTypes.ObjectId, ref:'User'}
        ]
    
})

module.exports = mongoose.model('Commune',communeSchema);
