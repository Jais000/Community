import React, { useEffect, useState } from 'react'
import './css/Communities.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
import { useParams,useNavigate } from 'react-router-dom';

const MakePost = (props) =>{
    const navigate = useNavigate();
    const {fId} = useParams();
    const {commId} = useParams();
    const post = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/makePost',{title:title,body:body,fId:fId,id:props.id})
        navigate('/Forum/'+commId)
    }
    const [title,setTitle] = useState("")
    const [body,setBody] = useState("")
    return(
        <>
        <h1>Post</h1>
        <form onSubmit={post}>
            <input placeholder="Title" type="text" onChange={(e)=>{setTitle(e.target.value)} }value={title}></input>
            <textarea rows="4" cols="50" placeholder='Content' type="text" onChange={(e)=>{setBody(e.target.value)} }value={body}></textarea>
            <button>Submit</button>
        </form>
        </>
    )
}
export default MakePost