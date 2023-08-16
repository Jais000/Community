//plugins//
const mongoose = require('mongoose');
const express = require("express")
let ejs = require('ejs')
const Commune = require('./models/commune')
const User = require('./models/user')
const Active = require('./models/active')
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')
const toId = mongoose.Types.ObjectId


var db = mongoose.connection;
const app = express()
mongoose.connect('mongodb://localhost:27017/Community')
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}))


function f(model){
  return JSON.parse(JSON.stringify(model))
}

////////
var activeUser
app.post('/sign_in',async(req,res)=>{
  const user = {name: req.body.email , password: req.body.password}
  activeUser = await User.find({email:req.body.email})
  console.log(await activeUser[0]._id);
  if(await Active.count() == 0){
    console.log(await Active.count());
    await Active.create({
      id: activeUser[0]._id
    })
  }else{
    await Active.deleteMany()
    await Active.create( {
      id: activeUser[0]._id 
    })
  }
  res.status(201).send() 
  activeUser = await Active.find() 
  })

//Home page //
app.get('/', async (req,res) => {
  activeUser = await Active.findOne({}).populate({path: "_id" , model:"User"})
  var name = JSON.parse(JSON.stringify(activeUser))._id.name
  
    res.render('userhome',{user: name})}
  )


//Search communities//
async function add(req){
  await User.updateMany({email:activeUser[0].email}, {$push:{communities:req.body.communities}})
}
app.post('/join',async(req,res)=>{
  var search =[]
  var input = Object.values(req.body)[0]
  
  for(var i =0; i < (await Commune.find({})).length;i++){  
    console.log((await Commune.find({}))[0].name);
    if((await Commune.find({}))[i].name.includes(input)){
      search.push((await Commune.find({}))[i].name)
    }}
    var ids = []
    for(var i=0;i<search.length;i++){
        ids.push(f(await Commune.find({name:search[i]}))[0]._id) 
    } 
  res.render('allcommunities',{communities:search, ids: ids})
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
app.get('/communities',async (req,res)=>{
  var comms = []
  activeUser = await Active.findOne({}).populate({path: "_id" , model:"User"})
  var communities = JSON.parse(JSON.stringify(await User.findById(JSON.parse(JSON.stringify(activeUser))._id._id))).communities
  for(var i=0;i< await communities.length;i++){
    var name = f(await Commune.findById(communities[i])).name
    console.log(name)
    comms.push(name)
  }
  res.render('communities', {communities:comms})
}

)



//create user//
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


//create community//
app.post("/commune",(req,res)=>{
  var name = req.body.name; 
  var address = req.body.address;
  var domain = req.body.redirect; 
  const commune = Commune.create({
    name: name,
    address: address,
    redirect: domain
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


  app.get("/community:id", async (req,res)=>{
    var id = req.url.split(":")[1]
    console.log(req.url.split(":")[1])
    var commune = f(await Commune.findById(id))
    res.render('communityhome',{commune: commune})
})

//Events//
app.get("/CreateEvent:id", async(req,res)=>{
  var comm_id = req.url.split(":")[1]
  console.log(f(await Commune.findById(comm_id)))
  res.render('createevent',{id:comm_id})
  
})
//CreateEvent//
app.post('/submit:id',async(req,res)=>{
  
  var event = {
    name:req.body.name,
    time:req.body.date,
    location:req.body.location,
    misc:""
  }
  await Commune.findByIdAndUpdate(  req.url.split(':')[1],{$push:{events:event}})
})
  //Events page
app.get("/events", async(req,res)=>{
  var commune = []
  var events = []
  var activeUser = await Active.findOne({}).populate({path: "_id" , model:"User"})
  var communities = f(activeUser)._id.communities
  for(var i = 0;i<communities.length;i++){
    console.log(communities[i])
    events.push(f(await Commune.findById(communities[i])).events)
    console.log(events)
  }
  var eventnames = []
  var times = []
  var locations = []
for(var i =0;i<events.length;i++){
  for(var j = 0;j<events[i].length;j++){
    eventnames.push(events[i][j].name)
    times.push(events[i][j].time)
    locations.push(events[i][j].location)
  }
}
res.render('events',{names: eventnames ,times:times, locations: locations })
})

//Join community//
app.get("/joincomm:id",async (req,res)=>{
  activeUser = await Active.findOne({}).populate({path: "_id" , model:"User"})
  var name = req.url.split(":")[1]
  var id = req.params.id.split(':')[1]
  console.log(await User.findByIdAndUpdate(JSON.parse(JSON.stringify(activeUser))._id._id,{$push:{communities:id}}))
})