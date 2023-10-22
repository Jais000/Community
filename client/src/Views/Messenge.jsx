import React, { useEffect, useState,useContext} from 'react'
import {useParams} from "react-router-dom"
import AuthContext from '../Context/AuthProvider';
import axios from 'axios';
import {
    Routes,
    Route,
    Link
} from "react-router-dom";
const Messenge = (props) =>{
    const {toid} = useParams();
    const [message,setMessage] = useState("")
    const send = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/send',{fromid:props.id,toid:toid, message:message})
    }
    return(
        <div className='root'>
        <h1>Send Message</h1>
        <form onSubmit={send}>
            <textarea onChange={(e)=>{setMessage(e.target.value)}} value={message} cols= '50' rows="5" placeholder='Send a message.'>
            </textarea>
            <div>
            <button>Send</button>
            </div>
        </form>
        </div>
    )
}
export default Messenge
