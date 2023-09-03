import mysql from 'mysql2' 
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

/////////////////////////COMMUNITY/////////////////////////////////
export async function getCommByEventId(event_id){
    var [rows] = await pool.query(`
        SELECT communes_id FROM events_has_communes
        WHERE events_id = ?
    `,[event_id])
    try{
    console.log(rows[0].communes_id)
    return rows[0].communes_id
    }catch{
        return 0
    }
}

export async function createCommunity(name,user){
    var userid=user
    await pool.query(`
        INSERT INTO communes (name)
        VALUES (?)
    `,[name])
    
    var [[commune]] = await pool.query(`
        select * from communes order by id desc limit 1
    `)
    console.log(commune)
    await pool.query(`
        INSERT INTO users_has_communes (user_id,commune_id)
        VALUES ((SELECT id FROM users WHERE id = ?),(SELECT id FROM communes WHERE id = ?))
    `,[userid,commune.id])
    await pool.query(`
        UPDATE users_has_communes
        SET isAdmin = 1
        WHERE user_id = ? AND commune_id = ? 
    `,[userid, commune.id])   

}
export async function getCommunities(){
    const [rows] = await pool.query(`
        SELECT * FROM communes
    `)
    return rows
}

export async function getRecentCommunityId(){
    const [rows] = await pool.query(`
        SELECT * FROM communes
        ORDER BY id DESC
        LIMIT 1
    `)
    return rows
}

export async function getCommunityById(id){
    const [rows] = await pool.query(`
        SELECT * FROM communes
        WHERE id = ?
    `,[id])
    return rows
}

export async function getCommunitiesByUserId(user_id){
    const [rows] = await pool.query(`
        SELECT commune_id, communes.name from users_has_communes 
        JOIN users ON users.id = users_has_communes.user_id 
        JOIN communes ON communes.id = users_has_communes.commune_id 
        WHERE users.id = ?
    `,[user_id])
    return rows
}
export async function createEvent(comm_id, event){
    await pool.query(`
        INSERT INTO events (event,isCommEvent)
        VALUES (?,?) 
    `,[event,1])
    var [event_id] = await pool.query(`
        SELECT * FROM events
    `)
    var cnt = 0;
    for(var i = 0;i<event_id.length;i++){
        if(event_id[i].id > cnt){cnt = event_id[i].id  }
    }
    await pool.query(`
        insert into events_has_communes (events_id,communes_id) 
        values (?,?)
    `,[cnt, comm_id])
}

export async function getUsersByCommunity(id){
    const [members] = await pool.query(`
    select user_id,isAdmin,name,email from users_has_communes 
    join users on users_has_communes.user_id = users.id 
    where commune_id = ?;
    `,[id])
    return members
}
export async function getCommunityEvents(id){
    const [rows] = await pool.query(`
    select events_id,event from events_has_communes 
    join events on events.id = events_has_communes.events_id 
    where communes_id = ?;
    `,[id])
    return rows
}

export async function editCommunityEvent(id,st,et){
    var [rows] = await pool.query(`
        select * from events WHERE id = ?;
    `,[id])
    
    var data = JSON.parse(rows[0].event)
    data.startTime = st
    data.endTime = et
    var dataString = JSON.stringify(data)
    await pool.query(`
        UPDATE events 
        set event = ?
        WHERE id = ?
    `,[dataString,id])
    
}
export async function vote(score,id){
    await pool.query(`
    UPDATE posts
    set votes = ?
    WHERE id = ?
    `,[score ,id])
}
/////////////////////FORUM//////////////////////////////////////
export async function delegate(user_id,comm_id){
    await pool.query(`
    UPDATE users_has_communes
    set isAdmin = 1
    WHERE user_id = ? 
    AND commune_id = ? 
    `,[user_id,comm_id])
}

export async function createPost(user_id,forum_id,title,content){
    await pool.query(`
        INSERT INTO posts (content,users_id,forums_id,title)
        VALUES (?,?,?,?)
    `,[content,user_id,forum_id,title])
}

export async function findHomeForumId(comm_id){
    var [rows] = await pool.query(`
        SELECT id FROM forums 
        WHERE communes_id = ? AND isHome = 1;
    `,[comm_id])
    return rows
}
export async function findHomeForumIdInverse(forum_id){
    var [rows] = await pool.query(`
        SELECT communes_id FROM forums 
        WHERE id = ? AND isHome = 1;
    `,[forum_id])
    return rows
}

export async function createForum(comm_id,name,isHome){
    await pool.query(`
        INSERT into forums (communes_id, name,isHome) 
        value (?,?,?);
    `,[comm_id,name,isHome])
}

export async function getPosts(id){
    var [rows] = await pool.query(`
        SELECT * FROM posts 
        WHERE forums_id = ?
    `,[id])

    return rows
}
export async function getPostById(id){
    var [rows] = await pool.query(`
    SELECT * FROM posts
    WHERE id = ?
    `,[id])
    return rows
}

export async function getComments(post_id){
    var [rows] = await pool.query(`
        SELECT * FROM comments
        WHERE posts_id = ?
    `,[post_id])
    return rows
}
export async function getCommIdByForum(forum_id){
    var [rows] = await pool.query(`
    SELECT communes_id FROM forums
    WHERE id = ?
    `,[forum_id])
    console.log(rows)
    return rows[0].communes_id
}
export async function getRecentForum(){
    var [rows] = await pool.query(`
    SELECT * FROM forums
    ORDER BY id DESC
    LIMIT 1
    `)
    return rows
}
export async function getForum(id){
    var rows = await pool.query(`
    SELECT * FROM forums
    WHERE id = ?
    `,[id])
    return rows
}
export async function createComment(post_id, content, user_id){
    await pool.query(`
    INSERT INTO comments (posts_id,content,users_id)
    VALUES (?,?,?)
    `,[post_id,content,user_id])
}
export async function getCommunityForums(comm_id){
    var [rows] = await pool.query(`
    SELECT * FROM forums
    WHERE communes_id = ?
    `,[comm_id])
    return rows
}
 export async function leaveCommunity(comm_id,user_id){
    await pool.query(`
    DELETE FROM users_has_communes
    WHERE commune_id = ? AND user_id = ?
    `,[comm_id,user_id])
}
/*
export async function deletePost(post_id)
{

}
export async function relegate(user_id){

}
export async function deleteComment(comment_id)
{

} */
export async function isMember(user_id, comm_id){
    var [rows] = await pool.query(`
    SELECT user_id FROM users_has_communes
    WHERE commune_id = ? 
    `,[comm_id])
    var ids = []
    rows.forEach(i=>{
        ids.push(i.user_id)
    })
    return ids.includes(user_id)
}
///////////////////////////USER////////////////////////////////////

/* export async function removeContact(user_id){

}

 */
export async function signin(id){
    await pool.query(`
        UPDATE activeid
        SET id = ?, isloggedin = ?
    `,[id,1])
}
export async function signout(){
    await pool.query(`
        UPDATE activeid
        SET id = ?, isloggedin = ?
    `,[0,0])
}

export async function getActiveId(){
    var [rows] = await pool.query(`
        SELECT * FROM activeid
    `)
    return rows;
}
export async function createUser(name, password, email){
    var [user] = await pool.query(`
    INSERT INTO users (email, name, password)
    VALUES (?,?,?)
    `,[email, name, password])
}

export async function joinCommunity(user_id,comm_id){
    await pool.query(`
        INSERT INTO users_has_communes (user_id, commune_id)
        VALUES ((SELECT id FROM users WHERE id = ?),(SELECT id FROM communes WHERE id = ?))
    `,[user_id,comm_id])
}

export async function getUserIdByEmail(email){
    const [rows] = await pool.query(`
    SELECT id 
    FROM users
    WHERE email = ?
    `,[email])
    return rows[0]
}
export async function getUserById(id){
    const [rows] = await pool.query(`
        select * from users where id =?
    `, [id])
    return rows[0]
}
export async function getUsers(){
    const [rows] = await pool.query('SELECT * FROM users')
    return rows
}
export async function getUser(id){
    const [rows] = await pool.query(`
        SELECT * 
        FROM users 
        WHERE id = ?
    `, [id])
    return rows[0]
}

export async function getUsersByCommId(comm_id){
    const [rows] = await pool.query(`
        select * from users 
        join users_has_communes 
        on users.id = users_has_communes.user_id
        WHERE commune_id = ?
    `, [comm_id])
    return rows
}

export async function getEventsByUserId(user_id){
    var values = []
    var events = []
    const [personalEvents] = await pool.query(`
    select events_id,event from users_has_events 
    join events 
    on users_has_events.events_id = events.id
    where users_id = ?; 
    `,[user_id])
    for(var i = 0; i< personalEvents.length;i++)
    {
        
        personalEvents[i].status = 1
        values.push(personalEvents[i])
    } 

    const [communalEvents] = await pool.query(`
    select events_id,event from users_has_communes 
    join events_has_communes 
    on users_has_communes.commune_id = events_has_communes.communes_id
    join events on events.id = events_id 
    where user_id = ?;
    `,[user_id])
    for(var i = 0; i< communalEvents.length;i++)
    {   
        var comm_id = await getCommByEventId(communalEvents[i].events_id)
        
        communalEvents[i].status = 0
        //console.log(communalEvents[i])
        values.push(communalEvents[i])
    } 

    return values
}

export async function isAdmin(user_id, comm_id){
    const [status] = await pool.query(`
        select * from users_has_communes where user_id = ? AND commune_id = ?
    `,[user_id,comm_id])
    
    return status[0].isAdmin
}
export async function addContact(activeId,contactId){
    await pool.query(`
        INSERT INTO users_has_users (users_id,users_id1)
        VALUES ((SELECT id FROM users WHERE id = ?),(SELECT id FROM users WHERE id = ?))
    `,[activeId,contactId])
    await pool.query(`
        INSERT INTO users_has_users (users_id1,users_id)
        VALUES ((SELECT id FROM users WHERE id = ?),(SELECT id FROM users WHERE id = ?))
    `,[activeId,contactId])
}
export async function getContactsById(id){
    var [rows] = await pool.query(`
        select users_id1 from users_has_users where users_id= ?
    `,[id])
    return rows 
}
export async function postMessage(fromid,toid,message){
    await pool.query(`
        INSERT INTO messages (Message)
        VALUES (?)
    `,[message])

    var [[messageid]] = await pool.query(`
        select * from messages order by id desc limit 1
    `)
    await pool.query(`
    INSERT INTO users_has_messages (users_id,messages_id,isSender)
    VALUES ((SELECT id FROM users WHERE id = ?),(SELECT id FROM messages WHERE id = ?),?)
    `,[fromid,messageid.id,1])
    await pool.query(`
    INSERT INTO users_has_messages (users_id,messages_id,isSender)
    VALUES ((SELECT id FROM users WHERE id = ?),(SELECT id FROM messages WHERE id = ?),?)
    `,[toid,messageid.id,0])
    
}
export async function getMessagesById(id){
    var senders = []
    var users =[]
    var [rows] = await pool.query(`
    select messages.id,Message from messages join users_has_messages 
    on messages.id = users_has_messages.messages_id 
    join users on  users.id = users_has_messages.users_id
    where isSender = 0 and users_id = ?;
    `,[id])
    for (var i =0;i<rows.length;i++){
        var [[sender]] = await pool.query(`
        select users_id from users_has_messages where isSender=1 and messages_id=?;
        `,[rows[i].id])
        senders.push(sender.users_id)
    }
    for (var i =0;i<senders.length;i++){
        var [[sent]] = await pool.query(`
        select * from users where id=?;
        `,[senders[i]])
        users.push(sent)
    }
    return [users,rows]
}
export async function createUserEvent(id,events){
    await pool.query(`
        INSERT INTO events (event,isCommEvent)
        VALUES (?,?) 
    `,[events,0])
    
    var [[cnt]] = await pool.query(`
        SELECT id FROM events ORDER BY id DESC LIMIT 1;
    `,)
    
    await pool.query(`
        insert into users_has_events (users_id,events_id) 
        values ((SELECT id FROM users WHERE id = ?),(SELECT id FROM events WHERE id = ?))
    `,[id,cnt.id])    
}

export async function editEvent(id,st,et){
    var [rows] = await pool.query(`
        select * from events WHERE id = ?;
    `,[id])
    var data = JSON.parse(rows[0].event)
    data.startTime = st
    data.endTime = et
    var dataString = JSON.stringify(data)
    await pool.query(`
        UPDATE events 
        set event = ?
        WHERE id = ?
    `,[dataString,id])
    
}