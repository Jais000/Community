import React, { useEffect, useState } from 'react'
import './css/Communities.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
const Messages = (props) => {

    const [sentMessages, setSentMessages] = useState([])
    const [recMessages, setRecMessages] = useState([])
    useEffect(()=>{
        axios.post('http://localhost:3000/recMessages',{id:props.id})
        .then(res=>setRecMessages(res.data))
        axios.post('http://localhost:3000/sentMessages',{id:props.id})
        .then(res=>setSentMessages(res.data))
    },[])
    const tomessage = (id) =>{
        props.message_id(id)
    }
    const del = (mid) =>{
        axios.delete('http://localhost:3000/deleteMessage/'+mid)
    }
    return(
        <div className='root'>
        <h1>Messages</h1>
            <div className='messages_cont'>
                {recMessages.map((i,j)=>{
                    
                    return (<div className='messs_button'><Link key={j} onClick = {()=>tomessage(i.messages_id)} to={'/Message'}>From {i.name}</Link> <button onClick={()=>del(i.messages_id)}>Delete</button></div>)
                    
                })}
            </div>
        </div>
    )
}
export default Messages