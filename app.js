import express from 'express'
const app = express()
import * as cql from './conn.js'
import bodyParser from'body-parser'
var name = ''; 
app.listen(3000,()=>{
})
app.set('views','C://Users//Jais//OneDrive//Projects//Communities//views')
app.set('view engine','ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.get('',async (req,res)=>{
    const users = await cql.getUsers()
    res.render('home',{name:name})
})





/////////////////////////COMMUNITY/////////////////////////////////
app.post('/search',async(req,res)=>{
    var searched = []
    var names = []
    var ids = []
    var search = req.body.search.toLowerCase()
    var comms = await cql.getCommunities()
    for(var i=0; i<comms.length;i++){
        if(comms[i].name.toLowerCase().includes(search) == true)
            {searched.push(comms[i])}
    }
    searched.forEach(comm=>{
        names.push(comm.name)
        ids.push(comm.id)
    })
    res.render('searchcommunities',{names:names,ids:ids})

})

app.post('/submitcomm', async(req,res)=>{  
    cql.createCommunity(req.body.name)
    var logged = await cql.getActiveId()
    res.render('home', {name:name, status:logged[0].isloggedin,id:logged[0].id})
})

//route to community page//
app.get('/community/:id', async(req,res)=>{
    var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
    console.log(comm)
    res.render('communityhome',{name:comm.name,id:comm.id})
})
//route to my communities page//
app.get('/MyCommunities/:id', async(req,res)=>{
    var comms = await cql.getCommunitiesByUserId(req.params.id.split(':')[1])
    console.log(comms)
    res.render('mycommunities',{comms:comms})
})

//create an Event//
app.post('/create_event/:id',async(req,res)=>{
    var name = req.body.name
    var time = req.body.time
    var loc = req.body.loc
    var string = '{"name":"'+name+'","time":"'+time+'" ,"loc":"'+loc+'"}' 
    cql.createEvent(req.params.id.split(':')[1], string)

})

//route to createCommunity//
app.get('/create_community', async(req,res)=>{
    res.render('create_community');
})

///////////////////////////USER////////////////////////////////////

//Sign up//
app.post('/submit',async (req,res)=>{
    var name = req.body.name
    var email = req.body.email
    var password = req.body.password
    cql.createUser(name,password,email)
    res.render('home')
})


//route to login//
app.get('/signin',async (req,res)=>{  
    res.render('login')
})

//login//
app.post('/s',async (req,res)=>{
    var id = await cql.getUserIdByEmail(req.body.email)
    console.log(id.id)
    var user = await cql.getUserById(id)
    cql.signin(id.id)
    name = user.name 
    var logged = await cql.getActiveId()
    console.log(logged)
    res.render('home',{name:name,status:logged[0].isloggedin,id:logged[0].id})
})

//logout//
app.post('/signout',async (req,res)=>{
    await cql.signout()
    var [rows]=await cql.getActiveId()
    res.render('home',{status:rows.isloggedin,id:rows.id})
})

//join community//
app.post('/join/:id',async(req,res)=>{
    var comm_id = req.params.id.split(':')[1]
    var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
    var activeId = await cql.getActiveId()
    cql.joinCommunity(activeId[0].id,comm_id)

    res.render('communityhome',{name:comm.name,id:comm.id})
})

//Render events for the user//
app.get('/user_events/:id',async(req,res)=>{
    var j_events= []
    var comms = []
    var events = await cql.getCommunityEventsByUserId(req.params.id.split(':')[1])
    for(var i = 0; i<events.length;i++){
        j_events.push(JSON.parse(events[i].event))
        console.log(events[i])
        comms.push({name: events[i].name, id: events[i].id})
        console.log(comms)
    }
    res.render('user_events', {events:j_events,comms:comms})
})