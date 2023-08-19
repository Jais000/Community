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
        SELECT * 
        FROM users 
        WHERE id = ?
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