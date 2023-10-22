import React, { useEffect, useState } from 'react'
import '../Views/css/Message.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'

const Message = (props) =>{
    useEffect(()=>{
        console.log("running effect")
        axios.get('http://localhost:3000/getMessage/'+props.mId)
        .then(res=>setMessage(res.data[0].Message))
    },[])
    
    const [message,setMessage]=useState("")
    return (
        
        <p>{message}</p>
    )
}
export default Message