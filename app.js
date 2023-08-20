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
app.use(express.static('Communities/public'))

app.get('/',async (req,res)=>{
    const users = await cql.getUsers()
    const [activeuser] = await cql.getActiveId()
    const status = activeuser.isloggedin
    res.render('home',{name:name,status:status,id:activeuser.id})
})





/////////////////////////COMMUNITY/////////////////////////////////
app.post('/search',async(req,res)=>{
    var searched = []
    var names = []
    var ids = []
    var searchedusers=[]
    var users = await cql.getUsers()
    var search = req.body.search.toLowerCase()
    var comms = await cql.getCommunities()
    for(var i=0; i<comms.length;i++){
        if(comms[i].name.toLowerCase().includes(search) == true)
            {searched.push(comms[i])}
    }
    for(var i = 0;i<users.length;i++){
        if(users[i].name.toLowerCase().includes(search) == true)
            {searchedusers.push(users[i])}        
    }
    console.log(searchedusers[0].id)
    searched.forEach(comm=>{
        names.push(comm.name)
        ids.push(comm.id)
    })
    
    res.render('searchcommunities',{names:names,ids:ids,users:searchedusers})

})
//Create Community//
app.post('/submitcomm', async(req,res)=>{  
    var logged = await cql.getActiveId()
    await cql.createCommunity(req.body.name,logged)
    res.render('home', {name:name, status:logged[0].isloggedin,id:logged[0].id})
})

//route to community page//
app.get('/community/:id', async(req,res)=>{
    var usercommids = []
    var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
    
    var [user] = await cql.getActiveId()
    console.log(user)
    var usercomms = await cql.getCommunitiesByUserId(user.id)
    usercomms.forEach(comm=>{
        usercommids.push(comm.commune_id)
    })
    if(usercommids.includes(comm.id)){   
        var status = await cql.isAdmin(user.id,comm.id)
        console.log(status)
    }else{
        status = 0
    }
    res.render('communityhome',{name:comm.name,id:comm.id,status:status})
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


//route to viewmembers//
app.get('/members/:id',async (req,res)=>{
    const members = await cql.getUsersByCommunity(req.params.id.split(':')[1])
    res.render('members',{members:members});
})


///////////////////////////USER////////////////////////////////////

//Sign up//
app.post('/submit',async (req,res)=>{
    var name = req.body.name
    var email = req.body.email
    var password = req.body.password
    var [logged] = await cql.getActiveId()
    await cql.createUser(name,password,email)
    res.render('home',{status:logged.isloggedin, id:logged.id})
})


//route to login//
app.get('/signin',async (req,res)=>{  
    res.render('login')
})

//login//
app.post('/s',async (req,res)=>{
    var id = await cql.getUserIdByEmail(req.body.email)
    console.log(id.id)
    var user = await cql.getUserById(id.id)
    cql.signin(id.id)
    console.log(user)
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

   // res.render('communityhome',{name:comm.name,id:comm.id})
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
//mycontacts//
app.get('/mycontacts/:id',async(req,res)=>{
    var contacts = [] 
    var contactids = await cql.getContactsById(req.params.id.split(':')[1])
    console.log(contactids[0])
    for(var i =0;i<contactids.length;i++){
        contacts.push(await cql.getUser(contactids[i].users_id1))
    }
    
    res.render('MyContacts', {contacts:contacts})
})
app.get('/userpage/:id',async(req,res)=>{
    var userId = req.params.id.split(':')[1]
    res.render('userspage',{userid:userId})
})
app.get('/addcontact/:id',async(req,res)=>{
    var [self] = await cql.getActiveId()
    console.log(self)
    var contact = req.params.id.split(':')[1]
    await cql.addContact(self.id,contact)
})

//messages//
app.post("/message/:id", async(req,res)=>{
    var message = req.body.message;
    console.log(message)
    var toid = req.params.id
    var [fromid] = await cql.getActiveId()
    console.log(toid)
    await cql.postMessage(fromid.id,toid,message)
})
//route to my messages//
app.get('/mymessages/:id',async(req,res)=>{

    var id = req.params.id.split(':')[1]
    var um=await cql.getMessagesById(id)
    console.log(um[1][0].Message)
    res.render('mymessages',{senders:um[0],messages:um[1]})
})