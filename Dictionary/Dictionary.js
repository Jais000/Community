//plugins//
const mongoose = require('mongoose');
const express = require("express")
let ejs = require('ejs')
const Commune = require('./models/commune')
const User = require('./models/user')
const Active = require('./models/active')
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')



var db = mongoose.connection;
const app = express()
mongoose.connect('mongodb://localhost:27017/Community')
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}))




////////
var activeUser
app.post('/sign_in',async(req,res)=>{
  const user = {name: req.body.email , password: req.body.password}
  activeUser = await User.find({email:req.body.email})
  console.log(await activeUser[0].name);
  if(await Active.count() == 0){
    console.log(await Active.count());
    await Active.create({
      name: await activeUser[0].name,
      email: await activeUser[0].email,
      phone: await activeUser[0].phone,
      pass: await activeUser[0].pass,
      communities: await activeUser[0].communities
    })
  }else{
    console.log('updating many')
    await Active.deleteMany()
    await Active.create( {
      name: await activeUser[0].name,
      email: await activeUser[0].email,
      phone: await activeUser[0].phone,
      pass: await activeUser[0].pass,
      communities: await activeUser[0].communities
    })
  }
  res.status(201).send() 
  activeUser = await Active.find() 
  })

////////////
app.get('/', async (req,res) => {
  activeUser = await Active.find()
  if(await Active.count() == 0){

  
  Commune.find({})
  .then((result)=>{
    var communities = [];
    result.forEach(commune=>{
      communities.push(commune.name);
    })
    
    res.render('userhome', {communities: communities,user:''})
  })
  .catch((err)=>{console.log(err.message)})}
  else
  {  Commune.find({})
  .then((result)=>{
    var communities = [];
    result.forEach(commune=>{
      communities.push(commune.name);
    })
    
    res.render('userhome', {communities: communities, user: activeUser[0].name })}
  )};})

  //filter function



/////////// Populate communities

async function add(req){
  await User.updateMany({email:activeUser[0].email}, {$push:{communities:req.body.communities}})
}
app.post('/join',async(req,res)=>{
  add(req)
})
////////////
app.get('/signup',(req,res)=>{
  res.render('index')
})
/////////////
app.listen(4000, function(){
  console.log('running')})
///////////
app.get('/sign_in',(req,res)=>{
  res.render('login')
})
///////////communities

async function community(){
  activeUser = await User.find({email:activeUser[0].email})
  return activeUser
}
app.get('/communities',async (req,res)=>{

  community();
  //console.log(activeUser[0].communities)
  await res.render('communities',{communities:activeUser[0].communities})
})





//user post///////////////////////////
app.post("/sign_up",(req,res)=>{
  var name = req.body.name; 
  var email = req.body.email;
  var phone = req.body.phone;
  var pass = req.body.pass; 
  const user = User.create({
    name: name,
    email:email,
    phone:phone,
    pass:pass,
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



