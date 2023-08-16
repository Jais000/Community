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
  var search =[]
  var input = Object.values(req.body)[0]

  for(var i =0; i < (await Commune.find({})).length;i++){  
    console.log((await Commune.find({}))[0].name);
    if((await Commune.find({}))[i].name.includes(input)){
      search.push((await Commune.find({}))[i].name)
    }}
  res.render('allcommunities',{communities:search})
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
  var redirects = []
  activeUser = await Active.findOne({})
  activeUser.communities.forEach(async (commune)=>{
    await Commune.find({name:commune}).then((result)=>{
      redirects.push(result[0].redirect)
      }).catch((err)=>{
      console.log(err);
    })
    })
  
  await res.render('communities',{redirects: redirects , communities:activeUser.communities})
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
    var name = req.url.split(":")[1]
    console.log(req.url)
    var commune = await Commune.find({name:name})
    console.log(commune[0].name)
    res.render('communityhome',{commune: commune})
})

//Events
app.get("/CreateEvent:id", async(req,res)=>{
  var name = req.url.split(":")[1]
  console.log(req.url)
  var commune = await Commune.find({name:name})
  console.log(commune[0].name)
  res.render('createevent',{commune:commune})
})

app.post('/submit:id',async(req,res)=>{
  var name = req.url.split(":")[1]
  var event = {
    name:req.body.name,
    time:req.body.date,
    location:req.body.location,
    misc:""
  }
  await Commune.updateOne({name:name},{$push:{events:event}})})
  //Events page
app.get("/events", async(req,res)=>{
  var commune = []
  var events = []
  const active = (await mongoose.connection.db.collection('actives').findOne({})).name
  const communes = (await mongoose.connection.db.collection('users').findOne({name:active})).communities

  for(var i = 0;i<communes.length;i++){
    console.log(communes[i])
    events.push((await mongoose.connection.db.collection('communes').findOne({name:communes[i]})).
    events)
    console.log(events)
  }

  for(var i = 0;i<events.length;i++){
    
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

//Join//
app.get("/joincomm:id",async (req,res)=>{
  var name = req.url.split(":")[1]
  console.log((await mongoose.connection.db.collection('actives').findOne({})).name )
  await User.updateOne({name: (await mongoose.connection.db.collection('actives').findOne({})).name },{$push:{communities:name}})
})