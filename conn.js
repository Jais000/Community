import mysql from 'mysql2' 
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user:process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

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

export async function createUser(name, password, email){
    await pool.query(`
        INSERT INTO users (email, name, password)
        VALUES (?,?,?)
    `,[email,name, password])
}
console.log(await getUsers())
/////////////////////////COMMUNITY/////////////////////////////////

export async function createCommunity(name){
    await pool.query(`
        INSERT INTO communes (name)
        VALUES (?)
    `,[name])
}
export async function getCommunities(){
    const [rows] = await pool.query(`
        SELECT * FROM communes
    `)
    return rows
}

///////////////////////////USER////////////////////////////////////