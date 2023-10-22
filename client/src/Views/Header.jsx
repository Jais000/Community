import React, { useEffect, useState } from 'react'
import {useNavigate} from "react-router-dom";
import './css/Header.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios';

axios.defaults.withCredentials = true


const Header = (props)=>{
    const navigate = useNavigate();
    const [search,setSearch] = useState("")
    const [user,setUser] = useState({})
useEffect(()=>{

    axios.get('http://localhost:3000/user/'+props.id)
    .then(res=>setUser(res.data))
},[props.cookieId])

const signOut = () =>{
    axios.post('http://localhost:3000/signout')
    .then(res=>{
        console.log(res.data)
    })
    props.sck(undefined)
}
const seek = (e) => {
    e.preventDefault();
    navigate('/Search/'+search)
}
    return(
        <div className="head_body">
            <h1>
               Community 
            </h1>
                <form onSubmit={seek}>
                    <input onChange={(e)=>{setSearch(e.target.value)}} value={search} placeholder="Search for Communities" type="text"></input>
                    <button>Search</button>
                </form>
                <div className="right">
                {props.id!=undefined?(
                    <>
                
                <Link to={'/'}>Home</Link>
                
                <a onClick={signOut}>Sign Out</a>
                </>
                ):( <>
                    <Link to={'/'}>Home</Link>
                    <Link to={'/SignIn'}>Sign In</Link>
                    </>)}
                
        
            </div>
        </div>
    )
}
export default Header