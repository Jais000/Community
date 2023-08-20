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

export async function createCommunity(name,user){
    var userid=user[0].id
    await pool.query(`
        INSERT INTO communes (name)
        VALUES (?)
    `,[name])

    var [[commune]] = await pool.query(`
        select * from communes order by id desc limit 1
    `)
    console.log(commune.id)
    await pool.query(`
        INSERT INTO users_has_communes (user_id, commune_id)
        VALUES (?,?)
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
        INSERT INTO events (event)
        VALUES (?) 
    `,[event])
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


///////////////////////////USER////////////////////////////////////
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
        VALUES (?,?)
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
    console.log(rows)
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
export async function getCommunityEventsByUserId(user_id){
    const [rows] = await pool.query(`
    select communes.id,communes.name,events.id,events.event from events join events_has_communes on events_has_communes.events_id = events.id join communes on events_has_communes.communes_id = communes.id 
    join users_has_communes on users_has_communes.commune_id = communes.id
    join users on users.id = users_has_communes.user_id where users.id = ?;
    `,[user_id])
    return rows
}

export async function isAdmin(user_id, comm_id){
    const [status] = await pool.query(`
        select * from users_has_communes where user_id = ? AND commune_id = ?
    `,[user_id,comm_id])
    console.log(status[0])
    return status[0].isAdmin
}
export async function addContact(activeId,contactId){
    await pool.query(`
        INSERT INTO users_has_users (users_id,users_id1)
        VALUES (?,?)
    `,[activeId,contactId])
    await pool.query(`
        INSERT INTO users_has_users (users_id,users_id1)
        VALUES (?,?)
    `,[contactId,activeId])
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
    console.log(toid)
    await pool.query(`
    INSERT INTO users_has_messages (users_id,messages_id,isSender)
    VALUES (?,?,?)
    `,[fromid,messageid.id,1])
    await pool.query(`
    INSERT INTO users_has_messages (users_id,messages_id,isSender)
    VALUES (?,?,?)
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