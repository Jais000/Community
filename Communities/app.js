import express from 'express'
const app = express()
import * as cql from './conn.js'
import bodyParser from'body-parser'
import f from 'express-fileupload'
import session from 'express-session'
import {Server} from 'socket.io'
import http from 'http'
import ws from 'ws'

var name = ''; 
app.use(session({
    secret:'pass',
    resave:true,
    saveUninitialized: false    
}))
app.use(f())
app.set('views','C://Users//Josh//OneDrive//Projects//Communities//views')
app.set('view engine','ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('Communities/public'))




/* app.listen(3000,()=>{
    console.log("listening on 3000")
}) */
const server = http.createServer(app)
const io = new Server(server);

io.on("connect",(socket)=>{
    console.log('connection')
    socket.on('chatMessage',(msg)=>{
        console.log(msg)
        io.emit('message',msg)
    })
})


server.listen(3000,function(){
    console.log('listening on port 3000')
})




async function getUserEvents(id){
    var startTimes = []
    var endTimes = []
    var names = []
    var locs = []
    var dates = []
    var details = []
    var files = []
    var ids = []
    var events = await cql.getEventsByUserId(id)
    for(var i = 0; i<events.length;i++){
        var event = JSON.parse(events[i].event)
        ids.push(events[i].events_id)
        startTimes.push(event.startTime)
        endTimes.push(event.endTime)
        dates.push(event.date)
        locs.push(event.loc)
        names.push(event.name)
        details.push(event.description)
        files.push(event.attachment)
        
    }
    

    return [names,dates,startTimes,endTimes,locs,details,files,ids]

}









app.get('/',async (req,res)=>{

    const users = await cql.getUsers()
    const [activeuser] = await cql.getActiveId()
    const status = activeuser.isloggedin

    var comms = await cql.getCommunitiesByUserId(activeuser.id)
    var contacts = await cql.getContactsById(activeuser.id)
    res.render('home',{name:name,
        status:req.session.loggedIn,
        loggedIn: req.session.loggedIn,
        id:req.session.iD,
        eventIds: req.session.eventIds,
        eventStartTimes : req.session.startTimes,
        eventEndTimes : req.session.endTimes,
        eventDates : req.session.dates,
        eventLocs:req.session.locs,
        eventDetails : req.session.files,
        eventFiles : req.session.details, 
        eventNames: req.session.names,
        comms:comms})
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
    searched.forEach(comm=>{
        names.push(comm.name)
        ids.push(comm.id)
    })

    res.render('searchcommunities',{names:names,ids:ids,users:searchedusers})

})
//Create Community//
app.post('/submitcomm', async(req,res)=>{
    var name = req.body.name
    await cql.createCommunity(name,req.session.iD)
    var comm = await cql.getRecentCommunityId()
    console.log(comm)
    var forumName = "Forum: "+ comm[0].name
    console.log(comm)
    await cql.createForum(comm[0].id,forumName,1)
    var events = await getUserEvents(req.session.iD)
    var comms = await cql.getCommunitiesByUserId(req.session.iD)
    res.redirect('/')
})





//route to community page//
app.get('/community/:id', async(req,res,next)=>{
    
    var usercommids = []
    var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
    console.log(comm)
    var [user] = await cql.getActiveId()
    var usercomms = await cql.getCommunitiesByUserId(req.session.iD)
    usercomms.forEach(comm=>{
        usercommids.push(comm.commune_id)
    })
    var status = 0
    var comms = []



    //if logged in
    try{
    req.session.comms.forEach((i)=>{
        comms.push(i.comm)
    })
    if(comms.includes(comm.id)){   
        var ind = comms.indexOf(comm.id)
        status = req.session.comms[ind].isAdmin
    }else{
        status = 0
    }
    
    var events = await cql.getCommunityEvents(comm.id)
    
    var names = []
    var dates =  []
    var startTimes = []
    var endTimes = []
    var locs = []
    var details = []
    var files = []
    var ids = []
    for(var i = 0; i<events.length;i++){
        var event = JSON.parse(events[i].event)
        startTimes.push(event.startTime)
        endTimes.push(event.endTime)
        dates.push(event.date)
        locs.push(event.loc)
        names.push(event.name)
        details.push(event.description)
        files.push(event.attachment)
        ids.push(events[i].events_id)
    }
    var user = await cql.getUserById(req.session.iD)
    var comms = await cql.getCommunitiesByUserId(req.session.iD)
    var homeForumId = await cql.findHomeForumId(comm.id)
    homeForumId= homeForumId[0].id
    console.log('Home: ',homeForumId)

    res.render('communityhome',{
        forumId:homeForumId,
        name:comm.name,
        status:status,
        id:comm.id,
        eventStartTimes : startTimes,
        eventEndTimes :endTimes,
        eventDates : dates,
        eventLocs:locs,
        eventDetails : details,
        eventFiles: files, 
        eventNames: names,
        comms:comms,
        eventIds:ids})
    }catch{//if not logged in
   


        var homeForumId = await cql.findHomeForumId(comm.id)
        homeForumId = homeForumId[0].id
        var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
        var events = await cql.getCommunityEvents(req.params.id.split(':')[1])
        console.log(comm)
        var names = []
        var dates = []
        var startTimes = []
        var endTimes = []
        var locs = []
        var details = []
        var files = []
        var ids = []
        for (var i = 0; i < events.length; i++) {
            var event = JSON.parse(events[i].event)
            startTimes.push(event.startTime)
            endTimes.push(event.endTime)
            dates.push(event.date)
            locs.push(event.loc)
            names.push(event.name)
            details.push(event.description)
            files.push(event.attachment)
            ids.push(events[i].events_id)
        }
                    res.render('communityhome',{
                        forumId:homeForumId,
                        name:comm.name,
                        status:0,
                        id:comm.id,
                        eventStartTimes : startTimes,
                        eventEndTimes :endTimes,
                        eventDates : dates,
                        eventLocs:locs,
                        eventDetails : details,
                        eventFiles: files, 
                        eventNames: names,
                        eventIds:ids}) 





    
                    }       
})
//route to Mycommunities page//
app.get('/MyCommunities/:id', async(req,res)=>{
    var comms = await cql.getCommunitiesByUserId(req.params.id.split(':')[1])
    res.render('mycommunities',{comms:comms})
})

//create an Event//
app.post('/create_event/:id',async(req,res)=>{
    var attachment = req.body.attachment
    var date = req.body.date
    var description = req.body.description
    var name = req.body.name
    var endTime = req.body.endTime
    var startTime = req.body.startTime
    var loc = req.body.loc
    var string = '{"name":"'+name+'","date":"'+date+'" ,"loc":"'+loc+'","startTime":"'+startTime+'","endTime":"'+endTime+'","description":"'+description+'","attachment":"' +attachment +'"}' 
    
    cql.createEvent(req.params.id.split(':')[1], string)

})

//route to createCommunity//
app.get('/create_community', async(req,res)=>{
    res.render('create_community');
})




//route to forum
app.get('/forum/:forumId',async (req,res)=>{
    

   console.log('forumId: ',req.params.forumId.split(':')[1])
    var comm = await cql.getCommIdByForum(req.params.forumId.split(':')[1])
    var com = await cql.getCommunityById(comm)
    
    com = com[0]
    console.log('com: ',com)
    var forumId = req.params.forumId.split(':')[1]
    
    var forum = await cql.getForum(forumId)
    var user = await cql.getUserById(req.session.iD)
    forum = forum[0][0]
    
    var comms = await cql.getCommunitiesByUserId(req.session.iD)
    var users = []
    var comments = []
    var posts = await cql.getPosts(forumId)
    
    for(var i =0;i<posts.length;i++){
        var user = await cql.getUserById(posts[i].users_id)
        users.push(user)
        var comment = await cql.getComments(posts[i].id)
        
        comments.push(comment.length) 
        
    }

    
    
    console.log('com: ',com)
    res.render('forum',{
        name: com.name,
        id:com.id,
        forumId:forumId,
        forum:forum,
        posts:posts,
        users:users,
        commentCounts:comments
        })
})
//route to chatroom
app.get('/chat/:id',async (req,res)=>{
    var usercommids = []
    var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
    
    var [user] = await cql.getActiveId()
    var usercomms = await cql.getCommunitiesByUserId(req.session.iD)
    usercomms.forEach(comm=>{
        usercommids.push(comm.commune_id)
    })
    var status = 0
    var comms = []
    req.session.comms.forEach((i)=>{
        comms.push(i.comm)
    })
    if(comms.includes(comm.id)){   
        var ind = comms.indexOf(comm.id)
        status = req.session.comms[ind].isAdmin
    }else{
        status = 0
    }


    var events = await cql.getCommunityEvents(comm.id)
    var names = []
    var dates =  []
    var startTimes = []
    var endTimes = []
    var locs = []
    var details = []
    var files = []
    for(var i = 0; i<events.length;i++){
        var event = JSON.parse(events[i].event)
        
        startTimes.push(event.startTime)
        endTimes.push(event.endTime)
        dates.push(event.date)
        locs.push(event.loc)
        names.push(event.name)
        details.push(event.description)
        files.push(event.attachment)
    }
    var user = await cql.getUserById(req.session.iD)
    
    var comms = await cql.getCommunitiesByUserId(req.session.iD)


    res.render('chat',{
        username: user.name,
        name:comm.name,
        status,status,
        id:comm.id,
        eventStartTimes : startTimes,
        eventEndTimes :endTimes,
        eventDates : dates,
        eventLocs:locs,
        eventDetails : details,
        eventFiles : files, 
        eventNames:names,
        comms:comms,
        })
})
app.post('/editCommunityEvent', async(req,res)=>{
    var data = JSON.parse(Object.keys(req.body)[0])
   
    //var id = req.params.id.split(':')[1]
    //var st = req.params.st.split(':')[1]
    //var et = req.params.et.split(':')[1]
    await cql.editCommunityEvent(data.id,data.st,data.et)

    //var e = await cql.getCommunityEvents(data.id)

})


app.get('/PostPage/:id',async(req,res)=>{

    res.render('createpost',{id:req.params.id.split(':')[1]})
})


app.post('/createPost/:id',async(req,res)=>{
    var forumId = req.params.id.split(':')[1]
    var title = req.body.title
    var content = req.body.content
    var userId = req.session.iD
    await cql.createPost(userId,forumId,title,content)
    var posts = await cql.getPosts(forumId)
    var forum = await cql.getForum(forumId)
    
    if(forum.isHome == 1){
    var commId = await cql.findHomeForumIdInverse(forumId)
    commId = commId[0].communes_id}
    else{
        commId = await cql.getCommIdByForum(forumId)
    }
    
    res.redirect('/forum/:'+forumId)
})

//route to create forum
app.get('/createForumPage/:id', async(req,res)=>{
    var id = req.params.id.split(':')[1]
    res.render('createforum',{comm_id:id})
})

app.post('/createForum/:id',async(req,res)=>{
    var comm_id = await cql.getCommIdByForum(req.params.id.split(':')[1])

    var name = req.body.name
    await cql.createForum(comm_id,name,0)
    var newForum = await cql.getRecentForum()
    newForum = newForum[0]
    

    //if()
    var [comm] = await cql.getCommunityById(comm_id)
    var forumId = newForum.id
    var user = await cql.getUserById(req.session.iD)
   
    //var comms = await cql.getCommunitiesByUserId(req.session.iD)
    var users = []
    var comments = []
    var posts = await cql.getPosts(forumId)
    //get usernames
    for(var i =0;i<posts.length;i++){
        var user = await cql.getUserById(posts[i].users_id)
        users.push(user)
        var comment = await cql.getComments(posts[i].id)
      
        comments.push(comment.length) 
    }
    res.redirect('/forum/:'+ forumId)
    
})

app.get('/post/:id', async(req,res)=>{
    
    var posts = await cql.getPostById(req.params.id.split(':')[1])
    
    posts = posts[0]
    try{
    var comm_id = await cql.getCommIdByForum(posts.forums_id)
    }catch{}
    try{
    var comments = await cql.getComments(posts.id)
    }catch{}
    var users = []
    
    try{
    if( comments.length> 0){
    comments = await cql.getComments(posts.id)
    for(var i = 0; i<comments.length;i++){
        
        var user = await cql.getUserById(comments[i].users_id)
       
        
        users.push(user)
        
    }}else{users=[]}
    }catch{}
    //
    if(posts!=undefined && comments!=undefined){
       
    res.render('post',{post:posts, id : comm_id,comments:comments,users:users})
}})
app.post('/comment/:id',async(req,res)=>{
    var id = req.params.id.split(':')[1]
    var posts = await cql.getPosts(id)
    posts = posts[0]
   
    await cql.createComment(id,req.body.content,req.session.iD)
    res.redirect('/post/:'+id)
})

app.post('/forumsearch/:id',async(req,res)=>{

    
    var searched = []
    var names = []
    var ids = []
    var searchedusers=[]
    //console.log(req.params.id.split(':')[1])
    var comm_id = await cql.getCommIdByForum(req.params.id.split(':')[1])
    
    var communityForums = await cql.getCommunityForums(comm_id)
    
    console.log(communityForums,communityForums.length)
    var search = req.body.search.toLowerCase()
    for(var i=0; i<communityForums.length;i++){
        console.log(communityForums[i].name.toLowerCase())
        if(communityForums[i].name.toLowerCase().includes(search) == true)
            {searched.push(communityForums[i])}
    }
    console.log(searched)

    res.render('forumsearch',{searched:searched})
    
})
app.post('/vote/:id',async(req,res)=>{
    var vote = parseInt(Object.keys(req.body)[0])
    var id = req.params.id.split(':')[1]
    var post = await cql.getPostById(id)
    var score = post[0].votes+vote
    
    await cql.vote(score,id)
})

                    //////////////////////////////
app.get('/members/:id', async(req,res)=>{
    var members = await cql.getUsersByCommId(req.params.id.split(':')[1])
    
  
    console.log(members)
    var status = await cql.isAdmin(req.session.iD,req.params.id.split(':')[1])
    console.log(status)
    res.render('members',{members:members,status:status,comm_id:req.params.id.split(':')[1]})
})
///////////////////////////USER////////////////////////////////////



app.post('/makeAdmin/:user_id', async(req,res)=>{
    var comm_id = Object.keys(req.body)[0]
    var user_id = req.params.user_id.split(':')[1]
    await cql.delegate(user_id,comm_id)
    console.log('successful delegation')
    res.redirect('/members/:'+comm_id)
})







//Sign up//
app.post('/submit',async (req,res)=>{
    var name = req.body.name
    var email = req.body.email
    var password = req.body.password
    var [logged] = await cql.getActiveId()
    var [activeuser] = await cql.getActiveId()
    await cql.createUser(name,password,email)
    var comms = await cql.getCommunitiesByUserId(activeuser.id)
    res.redirect('/')
})


//route to login//
app.get('/signin',async (req,res)=>{  
    res.render('login')
})

//login//
app.post('/s',async (req,res)=>{
    
    var id = await cql.getUserIdByEmail(req.body.email)
    var id = id.id
    var communes = []
    var comms = await cql.getCommunitiesByUserId(id)
    //console.log(comms)
    for (var i =0;i<comms.length;i++){
        var status = await cql.isAdmin(id,comms[i].commune_id)
        //console.log(status)
        communes.push({'comm':comms[i].commune_id,'isAdmin':status})    
    }

    
    var e = await getUserEvents(id)
    req.session.comms = communes
    req.session.loggedIn=true;
    req.session.iD = id
    req.session.eventIds = e[7]
    req.session.startTimes = e[2] 
    req.session.endTimes = e[3]
    req.session.dates = e[1]
    req.session.locs = e[4]
    req.session.details = e[5]
    req.session.files = e[6]
    req.session.names = e[0] 
    req.session.comms.forEach((i)=>{
        
    })
    res.redirect('/')})


//logout//
app.post('/signout',async (req,res)=>{
    await cql.signout()
    req.session.loggedIn = false;
    req.session.destroy()
    var [rows]=await cql.getActiveId()
    var [activeuser] = await cql.getActiveId()
    var comms = await cql.getCommunitiesByUserId(activeuser.id)
    res.redirect('/')
})

//join community//

app.post('/join/:id',async(req,res)=>{
    var comm_id = req.params.id.split(':')[1]
    var [comm] = await cql.getCommunityById(req.params.id.split(':')[1])
    var activeId = await cql.getActiveId()
    cql.joinCommunity(req.session.iD,comm_id)

   // res.render('communityhome',{name:comm.name,id:comm.id})
})

//Render events for the user//
app.get('/user_events/:id',async(req,res)=>{
    var j_events= []
    var comms = []
    var events = await cql.getEventsByUserId(req.params.id.split(':')[1])
    for(var i = 0; i<events.length;i++){
        j_events.push(JSON.parse(events[i].event))
        comms.push({name: events[i].name, id: events[i].id})
    }
    res.render('user_events', {events:j_events,comms:comms})
})
//mycontacts//
app.get('/mycontacts/:id',async(req,res)=>{
    var contacts = [] 
    var contactids = await cql.getContactsById(req.params.id.split(':')[1])
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
    var contact = req.params.id.split(':')[1]
    try{
    await cql.addContact(req.session.iD,contact)
    }catch{
        console.log('Already a contact')
    }
})

//messages//
app.post("/message/:id", async(req,res)=>{
    var message = req.body.message;
    var toid = req.params.id
    var fromid = req.session.iD
    await cql.postMessage(fromid,toid,message)
})
//route to my messages//
app.get('/mymessages/:id',async(req,res)=>{

    var id = req.params.id.split(':')[1]
    var um=await cql.getMessagesById(id)
    res.render('mymessages',{senders:um[0],messages:um[1]})
})
var flag;
import hb from 'express-handlebars'
import path from 'path'
import mv from 'mv'
//create user event//
app.post('/create_user_event/:id', async(req,res)=>{
    var id = req.session.iD
    
    var userEvents = await cql.getEventsByUserId(id)
    var endTimes = []
    var startTimes = []
    var events = []
    var years = []
    var days = []
    var months = []
    var startValue = parseFloat(req.body.startTime.split(':')[0]) + parseFloat(req.body.startTime.split(':')[1]/60)
    var endValue = parseFloat(req.body.endTime.split(':')[0]) + parseFloat(req.body.endTime.split(':')[1]/60)
    try{
    let file = req.files.attachment;
    file.mv('Communities/uploads/'+file.name,function(err){
        if(err)return res.status(500).send(err)
    })
    var data = req.files.attachment.data.toString('base64')
    req.body['attachment'] = data
    }catch{
        req.body['attachment'] = ''
    }

    
    
    if(endValue>startValue){
        


        for(var i = 0;i<userEvents.length;i++){


            var endTime = JSON.parse(userEvents[i].event).endTime
            var startTime = JSON.parse(userEvents[i].event).startTime
            days.push(JSON.parse(userEvents[i].event).date.split('-')[2])
            years.push(JSON.parse(userEvents[i].event).date.split('-')[0])
            months.push(JSON.parse(userEvents[i].event).date.split('-')[1])
            startTimes.push(parseFloat(startTime.split(':')[0]) +parseFloat(startTime.split(':')[1]/60))
            endTimes.push(parseFloat(endTime.split(':')[0]) +parseFloat(endTime.split(':')[1]/60))
        }
        


        var startValue = parseFloat(req.body.startTime.split(':')[0]) + parseFloat(req.body.startTime.split(':')[1]/60)
        var endValue = parseFloat(req.body.endTime.split(':')[0]) + parseFloat(req.body.endTime.split(':')[1]/60)
        var date = req.body.date
        flag = 0;
        for(var i = 0;i<startTimes.length;i++){


            if( date.split('-')[0] == years[i] && 
                date.split('-')[1] == months[i] &&
                date.split('-')[2] == days[i] &&
                ((startValue > startTimes[i] && startValue < endTimes[i]) ||
                (endValue > startTimes[i] && endValue < endTimes[i]) ||
                (startValue <=  startTimes[i] && endValue >= endTimes[i])))
                {
                    
                    flag = 1
                }
        }
        if(flag==0){
        await cql.createUserEvent(id, JSON.stringify(req.body))
        console.log('good to go')
        }
        else{
            console.log('confliction')
        }
    }else{console.log('end time is before start time')}

})
//add contact//

//Edit Event//
app.post('/edit', async(req,res)=>{
    var data = JSON.parse(Object.keys(req.body)[0])
    //var id = req.params.id.split(':')[1]
    //var st = req.params.st.split(':')[1]
    //var et = req.params.et.split(':')[1]
    await cql.editEvent(data.id,data.st,data.et)
    var e = await getUserEvents(req.session.iD)
    req.session.eventIds = e[7]
    req.session.startTimes = e[2] 
    req.session.endTimes = e[3]
    req.session.dates = e[1]
    req.session.locs = e[4]
    req.session.details = e[5]
    req.session.files = e[6]
    req.session.names = e[0]
    req.session.save()
})

io.on('connection',(socket)=>{
    console.log('connected')
})
