
import "https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"
import $ from 'jquery';
import {useNavigate} from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react'
import './css/Header.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios';
axios.defaults.withCredentials = true



const Index = (props) =>{
  const navigate = useNavigate()
  const [search,setSearch] = useState("")
  const seek = (e) => {
    e.preventDefault();
    navigate('/Search/'+search)
}
useEffect(()=>{
    axios.get('http://localhost:3000/session')
    .then(res=>console.log(res.data))
    console.log(props.cookie);console.log(props.cookie==undefined)
})
return(
<>
<div className="content">
  <h1>Community</h1>
  <form onSubmit={seek}>
                    <input onChange={(e)=>{setSearch(e.target.value)}} value={search} placeholder="Search for Communities" type="text"></input>
                    <button>Search</button>
                </form>

</div>
</> 
)}
export default Index