import React, { useEffect, useState } from 'react'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
const CreateCommunity = (props) => {
    const [name,setName] = useState("")
    const create = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/create',{name:name,id: props.id})
    }


return(
    <div className='root'>
    <div>
    <h1>Create a Community</h1>
    </div>
    <form onSubmit={create}>
        <input type="text" placeholder='Name' onChange={(e)=>{setName(e.target.value)}} value={name}></input>
        <button>Create</button>
    </form>
    </div>
)
}
export default CreateCommunity
