import express from 'express'
const app = express()
import * as cql from './conn.js'
import bodyParser from'body-parser'
var activeId;
var name = ''; 
app.listen(3000,()=>{
    console.log('Server running on 3000')
})
app.set('views','C://Users//Jais//OneDrive//Projects//Communities//views')
app.set('view engine','ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
var activeUser; 
app.get('',async (req,res)=>{
    const users = await cql.getUsers()
    res.render('home',{name:name})
})


app.get('/signin',async (req,res)=>{  
    res.render('login')
})
app.post('/s',async (req,res)=>{
    console.log(req.body.email)
    var id = await cql.getUserIdByEmail(req.body.email)
    activeId = id.id
    var user = await cql.getUserById(activeId)
    name = user.name 
    console.log(name)
    res.render('home',{name:name})
})
app.post('/submit',async (req,res)=>{
    console.log(req.body)
    var name = req.body.name
    var email = req.body.email
    var password = req.body.password
    cql.createUser(name,password,email)
    res.render('home')
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
    console.log(searched)
    searched.forEach(comm=>{
        names.push(comm.name)
        ids.push(comm.id)
    })
    console.log(names,ids)
    res.render('searchcommunities',{names:names,ids:ids})

})

app.post('/submitcomm', async(req,res)=>{  
    cql.createCommunity(req.body.name)
    res.render('home', {name:name})
})


///////////////////////////USER////////////////////////////////////