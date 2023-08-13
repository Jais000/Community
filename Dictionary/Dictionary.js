const mongoose = require('mongoose');
const express = require("express")
var bodyParser = require("body-parser")
const app = express()
app.use(bodyParser.json())
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended:true
}))
mongoose.connect('mongodb://localhost:27017/Community',{useNewUrlParser:true, useUnifiedTopology:true})
var db = mongoose.connection;
db.on('error',()=>console.log("Error in Connecting to Database"))
db.once('open',()=>console.log("Connected to Database"))
app.post("/sign_up",(req,res)=>{
  var name = req.body.name; 
  var email = req.body.email;
  var phone = req.body.phone;
  var pass = req.body.pass; 
  var data = {
    "name": name,
    "email": email,
    "phone": phone,
    "pass": pass
  }
  db.collection('users').insertOne(data,(err,collection)=>{
    if(err){
      throw err 
    }
    console.log("Record Inserted Successfully")
  });
  return res.sendFile('signup_success.html', {
    root: './Dictionary/public'
  })
})
app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: './Dictionary/public'
  })
}).listen(3000)
console.log("Listening on PORT 3000")