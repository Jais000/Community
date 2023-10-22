import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'

const CComment = (props) => {
    const {pid,cid} = useParams();
    const [comm,setComm] = useState("")
    const comment = (e) =>{
        e.preventDefault();
        axios.post('http://localhost:3000/ccomment',{comment:comm, cid:cid, pId:pid, id:props.id})
    }
    useEffect(()=>{
        console.log(cid)
    },[])
    return (
    <>
        <h1>Comment</h1>
        <form onSubmit={comment}>
        <textarea onChange={(e)=>{setComm(e.target.value)}} value={comm} placeholder='Write Something'>

        </textarea>
        <button>Comment</button>
    </form>
    </>
    )
}
export default CComment