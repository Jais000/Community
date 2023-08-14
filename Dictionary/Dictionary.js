//plugins//
const mongoose = require('mongoose');
const express = require("express")
let ejs = require('ejs')
const Commune = require('./models/commune')
const User = require('./models/user')
const bodyParser = require("body-parser")




var db = mongoose.connection;
const app = express()
mongoose.connect('mongodb://localhost:27017/Community')
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}))

app.get('/', async (req,res) => {
  User.find({community:"Hope Chapel"})
  .then((result)=>{
    var members = [];
    result.forEach(member=>{
      members.push(member.name);
    })
    res.render('Homepage', {Community:'Hope',members: members})
  })
  .catch((err)=>{console.log(err.message)})}
);

app.get('/signup',(req,res)=>{
  res.render('index')
})

app.listen(3000, function(){
  console.log('running')})







//user post///////////////////////////
app.post("/sign_up",(req,res)=>{
  var name = req.body.name; 
  var email = req.body.email;
  var phone = req.body.phone;
  var pass = req.body.pass;
  var community = req.body.community 
  const user = User.create({
    name: name,
    email:email,
    phone:phone,
    pass:pass,
    community:community
  })
  db.collection('users').insertOne(user,(err,collection)=>{
    if(err){
      throw err 
    }
    console.log("Record Inserted Successfully")
  });
  return res.sendFile('signup_success.html', {
    root: './Dictionary/public'
  })
})


//community post/////////////////////////////
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



