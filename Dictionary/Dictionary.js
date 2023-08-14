const mongoose = require('mongoose');
const express = require("express")
var bodyParser = require("body-parser")
const Commune = require('./models/Commune')




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

//user post
app.post("/sign_up",(req,res)=>{
  var name = req.body.name; 
  var email = req.body.email;
  var phone = req.body.phone;
  var pass = req.body.pass;
  var community = req.body.community 
  var data = {
    "name": name,
    "email": email,
    "phone": phone,
    "community": community,
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

//community post
app.post("/commune",(req,res)=>{
  var name = req.body.name; 
  var address = req.body.address;

  const commune = Commune.create({
    name: name,
    address: address
  })

  db.collection('users').insertOne(commune,(err,collection)=>{
    if(err){
      throw err 
    }
    console.log("Community Inserted Successfully")
  });
  return res.sendFile('community_signup_success.html', {
    root: './Dictionary/public'
  })
})

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: './Dictionary/public'
    })
  }).listen(3000)
console.log(mongoose.Collection)

console.log("Listening on PORT 3000")