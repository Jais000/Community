const mysql = require('mysql2')



const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'pass',
    database: 'communities'
}).promise()

module.exports.getUser = async (request,response) => {
    const [results] = await pool.query("SELECT * FROM users WHERE id = ?",[request.params.id])
    response.json(results)
}

module.exports.getContacts = async (request,response) => {
    const [results] = await pool.query(`
    select * from users_has_users join users on users_id1 = id WHERE users_id = ?
    `,[request.params.id])
    response.json(results)
}

module.exports.add = async (request,response) => {
    await pool.query(`
    INSERT INTO users_has_users (users_id,users_id1)
    VALUES (?,?)
    `,[request.body.fromid,request.body.toid])
    await pool.query(`
    INSERT INTO users_has_users (users_id,users_id1)
    VALUES (?,?)
    `,[request.body.toid,request.body.fromid])
}

module.exports.sendMessage = async (request,response) => {
    await pool.query(`
        INSERT INTO messages (Message)
        VALUES (?)
    `,[request.body.message])
    const [newId] = await pool.query(`
    SELECT id FROM messages ORDER BY id DESC LIMIT 1
    `)
    await pool.query(`
    INSERT INTO users_has_messages (users_id,messages_id,isSender)
    VALUES (?,?,?)
    `,[request.body.fromid,newId[0].id,1])
    await pool.query(`
    INSERT INTO users_has_messages (users_id,messages_id,isSender)
    VALUES (?,?,?)
    `,[request.body.toid,newId[0].id,0])
    
    
}


module.exports.getUsers = async (request,response) => {
    const [results] = await pool.query("SELECT * FROM users")
    response.json(results)
}

module.exports.createUser = async (request,response)=>{
    await pool.query(`
    INSERT INTO users (name,email,password)
    VALUES (?,?,?)
    `,[request.body.name,request.body.nemail,request.body.npass])
    .catch(err => response.json(err))
}

module.exports.signIn = async (request, response)=>{
    var emails = []
    
    const [results] = await pool.query(`
    SELECT id,email,password FROM users
    `)
    
    results.map(i=>{
        if (i.email == request.body.email && i.password == request.body.pass){

            request.session.Id = i.id
            request.session.Email = i.email
            request.session.save()
            response.json({status:"success",id:request.session.Id,session:request.session})
        }})
    
}

module.exports.signout = async (request,response)=>{
    response.json(request.session)
    request.session.destroy()
}

module.exports.session = async (request,response)=>{

    response.json(request.session)
}
module.exports.date = async (request,response)=>{
    const [date] = await pool.query(`
    SELECT CURDATE()
    `)
    cdate = JSON.stringify(date[0]['CURDATE()']).split('T')[0].split('"')[1]
    response.json(cdate)
}
module.exports.weekday = async (request,response)=>{
    const [date] = await pool.query(`
    SELECT DAYOFWEEK(?)
    `,[request.params.date])
    var day = Object.values(date[0])[0]
    response.json(day)
    
}

module.exports.getFriendship = async (request,response)=>{
    const [friends] = await pool.query(`
    select users_id1 from users_has_users where users_id = ?
    `,[request.params.id])
    friends.map(i=>i.users_id1).some(i=> i == parseInt(request.params.fid))? response.json(1):response.json(0)
   
    
}

module.exports.create = async (request,response)=>{
    request.body.allDay == true?
    await pool.query(`
    INSERT INTO events (event,isCommEvent)
    VALUES (?,0)
    `,[
        JSON.stringify(    {
            extendedProps: {
                id: 0,
                desc: request.body[2]
              },
            title:"",
            start:"",
            end:"",
            editable : true,
            allDay:request.body.allDay
        })]):
        await pool.query(`
        INSERT INTO events (event,isCommEvent)
        VALUES (?,0)
        `,[
            JSON.stringify(    {
                extendedProps: {
                    id: 0,
                    desc: request.body[2]
                  },
                title:"",
                start:"",
                editable : true,
                allDay:request.body.allDay
            })])

    const [eventId] = await pool.query(`
        SELECT id,event FROM events ORDER BY id DESC LIMIT 1
        `)
        
        const {id,event} = eventId[0]
        const evnt = JSON.parse(event)
        evnt.extendedProps.id = id  
        ev = JSON.parse(event)
        
        
        evnt.title = request.body[0].title
        evnt.start = request.body[0].start
        evnt.end = request.body[0].end
        
    
         if(evnt.start==evnt.end){
            if(parseInt(evnt.end.split("T")[1].split(":")[0]) == 23)
            {
                
              evnt.end = [evnt.end.split('T')[0],[ "01",evnt.end.split(":")[1]].join(':')].join('T')
            }
            else if
            (parseInt(evnt.start.split("T")[1].split(":")[0])<9)
            {evnt.end = [evnt.end.split('T')[0],[ "0" + (parseInt(evnt.end.split("T")[1].split(":")[0])+1).toString() ,evnt.end.split(":")[1]].join(':')].join('T')}
            else{    
        evnt.end = [evnt.end.split('T')[0],[ parseInt(evnt.end.split("T")[1].split(":")[0])+1,evnt.end.split(":")[1]].join(':')].join('T')
            }
        
            } 
    await pool.query(`
    UPDATE events SET event = ? WHERE id = ?
    `,[JSON.stringify(evnt),id])

    await pool.query(`
    INSERT INTO users_has_events (users_id,events_id)
    VALUES (?,?)
    `,[request.body[1],id])   
}

module.exports.createMultiEvent = async (request,response)=>{
    var map = Object.entries(request.body[4]).map((v,k)=>[k,v[1]]).filter(i=>i[1]==true).map(i=>i[0])
    const off = new Date().getTimezoneOffset() * 60 * 1000
    var s = new Date(new Date(request.body[0].start.split('T')[0]+'T'+request.body[0].sTime).getTime()-off)
    var e = new Date(new Date(request.body[0].end.split('T')[0]+'T'+request.body[0].sTime).getTime()-off)
    var se = new Date(new Date(request.body[0].start.split('T')[0]+'T'+request.body[0].eTime).getTime()-off)
    var cnt = s.getDay()

    //var map = Object.entries(request.body[4]).map((v,k)=>[k,v[1]]).filter(i=>i[1]==true).map(i=>i[0])

    function dateDiffInDays(a, b) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
      }
      const diff = dateDiffInDays(s,e)
      var obj 
      
      
      var [rec] = await pool.query(`
      select event from events
      `) 
      try{
        var order = rec.map(i=>{return JSON.parse(i.event).extendedProps.groupId}).sort().filter(i=>typeof i == 'number')
        if (order.length > 0){rec = (Math.max(...order))}else{ rec  = 0;}
        
    }catch{
        rec = 0
        console.log('sec: ',rec)}
      
      for(var i = 0;i<diff;i++){
        if(map.includes(cnt)){
        await pool.query(`
        INSERT INTO events (event,isCommEvent)
        VALUES (?,0)
        `,[
        obj =JSON.stringify(    {
            extendedProps: {
                id: 0,
                desc: "",
                groupId: rec+1
              },
            title:"",
            start:"",
            end:"",
            editable : true,
            allDay:request.body.allDay
        })])
        
        var [eventId] = await pool.query(`
        SELECT event,id FROM events ORDER BY id DESC LIMIT 1
        `)

        const {id,event} = eventId[0]
        const evnt = JSON.parse(event)
        evnt.extendedProps.id = id  
        evnt.title = request.body[0].title
        evnt.start = s
        evnt.end = se
        evnt.extendedProps.desc = request.body[2]
        evnt.extendedProps.privacy = request.body[3]
        
        await pool.query(`

        INSERT INTO users_has_events (users_id,events_id)
        VALUES (?,?)
        `,[request.body[1],id]) 
        await pool.query(`
        UPDATE events SET event = ? WHERE id = ?
        `,[JSON.stringify(evnt),id])

    }     
            s = new Date(s.getTime() + 1000*60*60*24)
            se = new Date(se.getTime() + 1000*60*60*24)
            
            cnt++ 
          cnt==7?cnt=0:cnt=cnt
      } 
    
    

}



module.exports.getUserEvents = async (request,response)=>{
    const [event] = await pool.query(`
    SELECT event FROM users_has_events JOIN events ON events_id = id WHERE users_id = ?
    `,[request.params.id])
    var events = event.map(i=>{
        
        return({status: 1,
                isCommEvent: 0,
                event: JSON.parse(i.event)})
    })

    const [rows] = await pool.query(`
    SELECT * FROM events JOIN events_has_communes ON events_id = id join users_has_communes on communes_id =commune_id where user_id = ?;
    `,[request.params.id])
    commevents = rows.map(i=>{
        return({status:i.isAdmin,
                isCommEvent: 1,
                event: JSON.parse(i.event)
                })
    })
    const total = events.concat(commevents)
    response.json(total)    
  
}
module.exports.update = async (request,response)=>{
    try{
    await pool.query(`
    UPDATE events SET event = ? WHERE id = ?
    `,[request.body.event, request.body.eventId]) 
    }catch(e){console.log(e.data)}
}
module.exports.delete = async(request,response)=>{
    await pool.query(`
    DELETE FROM events WHERE id = ?
    `,[request.params.id])
}


module.exports.deleteMulti = async(request,response)=>{

    const [events] = await pool.query(`
    SELECT * FROM events 
    `)
    for (let v in events.filter(i=>JSON.parse(i.event).extendedProps.groupId == request.params.gId))
    {
        
        await pool.query(`
        DELETE FROM events WHERE id = ?
        `,[events.filter(i=>JSON.parse(i.event).extendedProps.groupId == request.params.gId)[v].id])
    }








}



module.exports.rec = async(request,response)=>{
    const [all] = await pool.query(`
    select * from messages join users_has_messages on id = messages_id join users on users_id=users.id
    `)
    const [res] = await pool.query(`
    select * from messages join users_has_messages on id = messages_id join users on users_id=users.id WHERE users_id = ? AND isSender = 0
    `,[request.body.id])
     const rec = all.filter(i=>
        res.map(j=>j.messages_id).includes(i.messages_id) && i.isSender == 1
    )
    response.json(rec)
}

module.exports.sent = async(request,response)=>{
    const [all] = await pool.query(`
    select * from messages join users_has_messages on id = messages_id join users on users_id=users.id
    `)
    
    const [res] = await pool.query(`
    select * from messages join users_has_messages on id = messages_id join users on users_id=users.id WHERE users_id = ? AND isSender = 1
    `,[request.body.id])

    const sent = all.filter(i=>
        res.map(j=>j.messages_id).includes(i.messages_id) && i.isSender == 0
    )
   
    response.json(sent)
}

module.exports.getMessage = async(request,response)=>{
    const [mess] = await pool.query(`
    SELECT Message FROM messages WHERE id = ?
    `,[request.params.mid])
    response.json(mess)
}

module.exports.deleteMessage = async(request,response)=>{
    const [mess] = await pool.query(`
    DELETE FROM messages WHERE id = ?
    `,[request.params.mid])
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.getUserCommunities = async(request,response)=>{
    const [comms] = await pool.query(`
    SELECT * FROM communes JOIN users_has_communes ON commune_id = id WHERE user_id = ?;
    `,[request.params.id])

    response.json(comms)    
}
module.exports.getCommEvents = async(request,response)=>{
    
    const [rows] = await pool.query(`
    SELECT * FROM events JOIN events_has_communes ON events_id = id WHERE communes_id = ?;
    `,[request.params.commId])
    events = rows.map(i=>{
        return JSON.parse(i.event)
    })
   
    response.json(events)    
}

module.exports.getStatus = async(request,response)=>{
    
    const [status] = await pool.query(`
    Select isAdmin from users_has_communes WHERE user_id=? AND commune_id=?
    `,[request.params.id,request.params.commId])
  
    if(status.length == 0){
        response.json(0)
    }else{
    response.json(status[0].isAdmin)
    }
}
module.exports.createCommEvent = async (request,response)=>{
    await pool.query(`
    INSERT INTO events (event,isCommEvent)
    VALUES (?,1)
    `,[
        JSON.stringify(    {
            extendedProps: {
                id: 0,
                private:request.body[3],
                desc:request.body[2]
              },
            title:"",
            start:"",
            end:"",
            editable : true,
        })])
    const [eventId] = await pool.query(`
        SELECT id,event FROM events ORDER BY id DESC LIMIT 1
        `)
        const {id,event} = eventId[0]
        const evnt = JSON.parse(event)
        evnt.extendedProps.id = id  
        ev = JSON.parse(event)
        evnt.title = request.body[0].title
        evnt.start = request.body[0].start
        evnt.end = request.body[0].end
        evnt.description = request.body[0].desc
        
        if(evnt.start==evnt.end){
            if(parseInt(evnt.end.split("T")[1].split(":")[0]) == 23)
            {
          
              evnt.end = [evnt.end.split('T')[0],[ "01",evnt.end.split(":")[1]].join(':')].join('T')
            }
            else if
            (parseInt(evnt.start.split("T")[1].split(":")[0])<9)
            {evnt.end = [evnt.end.split('T')[0],[ "0" + (parseInt(evnt.end.split("T")[1].split(":")[0])+1).toString() ,evnt.end.split(":")[1]].join(':')].join('T')}
            else{    
        evnt.end = [evnt.end.split('T')[0],[ parseInt(evnt.end.split("T")[1].split(":")[0])+1,evnt.end.split(":")[1]].join(':')].join('T')
            }} 
    await pool.query(`
    UPDATE events SET event = ? WHERE id = ?
    `,[JSON.stringify(evnt),id])
   
    await pool.query(`
    INSERT INTO events_has_communes (events_id,communes_id)
    VALUES (?,?)
    `,[id,request.body[1]])   
}


module.exports.createMultiCommEvent = async (request,response)=>{
    var map = Object.entries(request.body[4]).map((v,k)=>[k,v[1]]).filter(i=>i[1]==true).map(i=>i[0])

    const off = new Date().getTimezoneOffset() * 60 * 1000
    var s = new Date(new Date(request.body[0].start.split('T')[0]+'T'+request.body[0].sTime).getTime())
    var e = new Date(new Date(request.body[0].end.split('T')[0]+'T'+request.body[0].sTime).getTime())
    var se = new Date(new Date(request.body[0].start.split('T')[0]+'T'+request.body[0].eTime).getTime())
    var cnt = s.getDay()
    function dateDiffInDays(a, b) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
      }
      const diff = dateDiffInDays(s,e)
      var obj 
      
      var [rec] = await pool.query(`
      select event from events
      `) 
      try{
        var order = rec.map(i=>{return JSON.parse(i.event).extendedProps.groupId}).sort().filter(i=>typeof i == 'number')
        if (order.length > 0){rec = (Math.max(...order))}else{ rec  = 0;}
        
    }catch{
        rec = 0}
        
      for(var i = 0;i<diff;i++){
        if(map.includes(cnt)){
        await pool.query(`
        INSERT INTO events (event,isCommEvent)
        VALUES (?,1)
        `,[
        obj =JSON.stringify(    {
            extendedProps: {
                id: 0,
                desc: "",
                groupId: rec+1
              },
            title:"",
            start:"",
            end:"",
            editable : true,
            allDay:request.body.allDay
        })])
        
        var [eventId] = await pool.query(`
        SELECT event,id FROM events ORDER BY id DESC LIMIT 1
        `)

        const {id,event} = eventId[0]
        const evnt = JSON.parse(event)
        evnt.extendedProps.id = id  
        evnt.title = request.body[0].title
        evnt.start = s
        evnt.end = se
        evnt.extendedProps.desc = request.body[2]
        evnt.extendedProps.privacy = request.body[3]
        await pool.query(`

        INSERT INTO events_has_communes (communes_id,events_id)
        VALUES (?,?)
        `,[request.body[1],id]) 
        await pool.query(`
        UPDATE events SET event = ? WHERE id = ?
        `,[JSON.stringify(evnt),id])

    }     
            s = new Date(s.getTime() + 1000*60*60*24)
            se = new Date(se.getTime() + 1000*60*60*24)
            cnt++ 
          cnt==7?cnt=0:cnt=cnt
      }
    
    

}




module.exports.createCommunity = async(request,response)=>{
    await pool.query(`
    INSERT INTO communes (name) VALUES (?)
    `,[request.body.name])
    
    const [newId] = await pool.query(`
    SELECT id FROM communes ORDER BY id DESC LIMIT 1
    `)
    await pool.query(`
    INSERT INTO users_has_communes (user_id,commune_id,isAdmin)
    VALUES (?,?,?)
    `,[request.body.id, newId[0].id,1])
    await pool.query(`
    INSERT INTO forums (communes_id,name,isHome)
    VALUES (?,?,1)
    `,[newId[0].id,`${request.body.name}'s Forum`])
    
}


module.exports.search = async(request,response)=>{
    const [results] = await pool.query(`
    select id,name from communes 
    `)
    const searched = results.filter(i=>i.name.toLowerCase().includes(request.params.search.toLowerCase()))

    response.json(searched)
}
module.exports.join = async(request,response)=>{
    try{
    await pool.query(`
    INSERT INTO users_has_communes (user_id,commune_id,isAdmin) 
    VALUES (?,?,?)
    `,[request.body.userId,request.body.commId,0])
    }
    catch{console.log('error')}
}
module.exports.isMember = async(request,response)=>{
    const [result] = await pool.query(`
    SELECT * FROM users_has_communes 
    WHERE user_id = ? AND commune_id = ?;
    `,[request.params.id,request.params.commId])
    result.length == 0? response.json(0):response.json(1)
    
}

module.exports.leave = async(request,response)=>{
    await pool.query(`
    DELETE FROM users_has_communes WHERE user_id = ? AND commune_id =?;
    `,[request.params.id,request.params.commId])
  
}

module.exports.getMembers = async(request,response)=>{
    const [results] = await pool.query(`
    Select * from users_has_communes join users on user_id = id WHERE commune_id = ?;
    `,[request.params.commId])

    response.json(results)
  
}

module.exports.delegate = async(request,response)=>{
    await pool.query(`
    UPDATE users_has_communes SET isAdmin = 1 
    WHERE user_id = ? AND commune_id = ?
    `,[request.body.id,request.body.commId])
  
}
module.exports.memberView = async(request,response)=>{
    const [thatcommIds] = await pool.query(`
        select communes_id from events join events_has_communes on events.id = events_id where id = ?;
    `,[request.params.eid])
    const [thiscommIds] = await pool.query(`
        select id from communes join users_has_communes on id = commune_id where user_id = ?
    `,[request.params.uid]) 

    response.json(thatcommIds.filter( i => thiscommIds.map(i=>i.id).includes(i.communes_id)))}


module.exports.mutuality = async(request,response)=>{
    const eids = request.body.events.map(i=>{return i.extendedProps.id})
    var cids = []
    for(var i =0;i<eids.length;i++)
    {
        cids.push( await pool.query(
            `
            select communes_id from events join events_has_communes on events.id = events_id where id =?
            `,[eids[i]]))
    }
    var [ucommids] = await pool.query(`
    select id from communes join users_has_communes on id = commune_id where user_id = ?    
    `,[request.body.uid])
    ucommids = ucommids.map(i=>i.id)
    cids = cids.map(i=>i[0][0])

    cids = cids.map(i=> i ==undefined? 0:Object.values(i)[0])
    //cids =cids.map(i=>i[0][0].communes_id)
    const ver = cids.map(i=>ucommids.includes(i)?true:false)
    response.json(ver)
    
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.getCommForum = async(request,response)=>{
    const[results] = await pool.query(`
    select * from forums WHERE communes_id = ? AND isHome=1 
    `,[request.params.commId])
    response.json(results[0])
}
module.exports.getPosts = async(request,response)=>{
    const[results] = await pool.query(`
    select * from posts WHERE forums_id = ?
    `,[request.params.fId])

    response.json(results)
}
module.exports.getPost = async(request,response)=>{
    const[results] = await pool.query(`
    select * from posts WHERE id = ?
    `,[request.params.pId])

    response.json(results)
}

module.exports.makePost = async(request,response)=>{
    const[results] = await pool.query(`
    INSERT INTO posts (title,content,users_id,forums_id,votes)
    VALUES (?,?,?,?,0)
    `,[request.body.title,request.body.body, request.body.id,request.body.fId])
    
}

module.exports.comment = async(request,response)=>{
    const[results] = await pool.query(`
    INSERT INTO comments (users_id,content,posts_id,votes,isChild,isParent)
    VALUES (?,?,?,0,0,0)
    `,[request.body.id,request.body.comment, request.body.pId])
    
}
module.exports.ccomment = async(request,response)=>{
    await pool.query(`
    INSERT INTO comments (users_id,content,posts_id,votes,isChild,isParent)
    VALUES (?,?,?,0,1,0)
    `,[request.body.id,request.body.comment, request.body.pId])
    const [newId] = await pool.query(`
    SELECT id FROM comments ORDER BY id DESC LIMIT 1
    `)
    await pool.query(`
    INSERT INTO comments_has_comments (pcomment,ccomment)
    VALUES (?,?)`,[request.body.cid,newId[0].id])
    await pool.query(`
    UPDATE comments SET isParent = 1 WHERE id = ?
    `,[request.body.cid])

}
module.exports.uv = async(request,response)=>{
    const [result] = await pool.query(`
    SELECT * FROM users_has_posts WHERE users_id=? AND posts_id =?
    `,[request.body.id,request.body.pid])
    if(result.length==0){
    await pool.query(`
        INSERT INTO users_has_posts (users_id,posts_id,total)
        VALUES (?,?,1)
        `,[request.body.id,request.body.pid])
        const[results] = await pool.query(`
        SELECT votes FROM posts WHERE id = ?
        `,[request.body.pid])
        const newv = results[0].votes+1
        await pool.query(`
        UPDATE posts SET votes = ? WHERE id = ?
        `,[newv,request.body.pid])
    }else if(result[0].total <=0){
        
        await pool.query(`
        UPDATE users_has_posts SET total = ? WHERE posts_id = ? AND users_id = ?
    `,[result[0].total+1,request.body.pid,request.body.id])
    const[results] = await pool.query(`
    SELECT votes FROM posts WHERE id = ?
`,[request.body.pid])
const newv = results[0].votes+1
await pool.query(`
UPDATE posts SET votes = ? WHERE id = ?
`,[newv,request.body.pid])
    }
}
module.exports.dv = async(request,response)=>{
    const [result] = await pool.query(`
    SELECT * FROM users_has_posts WHERE users_id=? AND posts_id =?
    `,[request.body.id,request.body.pid])
    if(result.length==0){
    await pool.query(`
        INSERT INTO users_has_posts (users_id,posts_id,total)
        VALUES (?,?,-1)
        `,[request.body.id,request.body.pid])
        const[results] = await pool.query(`
        SELECT votes FROM posts WHERE id = ?
        `,[request.body.pid])
        const newv = results[0].votes-1
        await pool.query(`
        UPDATE comments SET votes = ? WHERE id = ?
        `,[newv,request.body.pid])
    }else if(result[0].total >=0){
        
        await pool.query(`
        UPDATE users_has_posts SET total = ? WHERE posts_id = ? AND users_id = ?
    `,[result[0].total-1,request.body.pid,request.body.id])
    const[results] = await pool.query(`
    SELECT votes FROM posts WHERE id = ?
`,[request.body.pid])
const newv = results[0].votes-1
await pool.query(`
UPDATE posts SET votes = ? WHERE id = ?
`,[newv,request.body.pid])
    }
}
module.exports.getComments = async(request,response)=>{
    const[results] = await pool.query(`
    select isParent,isChild,comments.id,content,posts_id,created_at,updated_at,votes,users_id,name,email,password from comments join users on users_id = users.id  WHERE posts_id = ?
    `,[request.params.pId])
    
    response.json(results)
}
module.exports.cuv = async(request,response)=>{
    const [result] = await pool.query(`
    SELECT * FROM users_has_comments WHERE users_id=? AND comments_id =?
    `,[request.body.id,request.body.cid])
    if(result.length==0){
    await pool.query(`
        INSERT INTO users_has_comments (users_id,comments_id,total)
        VALUES (?,?,1)
        `,[request.body.id,request.body.cid])
        const[results] = await pool.query(`
        SELECT votes FROM comments WHERE id = ?
        `,[request.body.cid])
        const newv = results[0].votes+1
        await pool.query(`
        UPDATE comments SET votes = ? WHERE id = ?
        `,[newv,request.body.cid])
    }else if(result[0].total <=0){
        
        await pool.query(`
        UPDATE users_has_comments SET total = ? WHERE comments_id = ? AND users_id = ?
    `,[result[0].total+1,request.body.cid,request.body.id])
    const[results] = await pool.query(`
    SELECT votes FROM comments WHERE id = ?
`,[request.body.cid])
const newv = results[0].votes+1
await pool.query(`
UPDATE comments SET votes = ? WHERE id = ?
`,[newv,request.body.cid])
    }


}
module.exports.cdv = async(request,response)=>{
    const [result] = await pool.query(`
    SELECT * FROM users_has_comments WHERE users_id=? AND comments_id =?
    `,[request.body.id,request.body.cid])
    if(result.length==0){
    await pool.query(`
        INSERT INTO users_has_comments (users_id,comments_id,total)
        VALUES (?,?,-1)
        `,[request.body.id,request.body.cid])
        const[results] = await pool.query(`
        SELECT votes FROM comments WHERE id = ?
        `,[request.body.cid])
        const newv = results[0].votes-1
        await pool.query(`
        UPDATE comments SET votes = ? WHERE id = ?
        `,[newv,request.body.cid])
    }else if(result[0].total >=0){
        
        await pool.query(`
        UPDATE users_has_comments SET total = ? WHERE comments_id = ? AND users_id = ?
    `,[result[0].total-1,request.body.cid,request.body.id])
    const[results] = await pool.query(`
    SELECT votes FROM comments WHERE id = ?
`,[request.body.cid])
const newv = results[0].votes-1
await pool.query(`
UPDATE comments SET votes = ? WHERE id = ?
`,[newv,request.body.cid])
    }
}

module.exports.getComment = async(request,response)=>{
    const[results] = await pool.query(`
    select isChild,isParent,content,posts_id,created_at,updated_at,votes,users_id,name,email,password from comments join users on users_id = users.id where comments.id = ?; 
    `,[request.params.cid])
    response.json(results)
}

module.exports.chain = async(request,response)=>{
    const[results] = await pool.query(`
    select pcomment,ccomment from comments join comments_has_comments on pcomment = id where id = ? 
    `,[request.params.cid])
    response.json(results)
}
module.exports.child = async(request,response)=>{
    const[results] = await pool.query(`
    select * from comments_has_comments where ccomment = ?
    `,[request.params.cid])
    results.length>0?response.json(true):response.json(false)
    
}
//    select * from forums join posts on forums.id = forums_id WHERE communes_id = ? AND isHome=1 