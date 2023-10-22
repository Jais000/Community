import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import './css/Communities.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
import Comm from '../Components/comm';

const Post = (props) => {
    const [isChild,setIsChild] = useState(false)
    const {pId,commId} = useParams();
    const [post,setPost] = useState({})
    const [commentData,setCommentData] = useState([])
    const [comm,setComm]=useState("");
    const [comments,setComments] = useState([])
    const [data ,setData] = useState({})
    const [isLoading,setIsLoading] = useState(1)

    useEffect(()=>{
        axios.get('http://localhost:3000/post/'+pId)
        .then(res=>setPost(res.data[0]))
        },[])
    useEffect(()=>{
        axios.get('http://localhost:3000/getComments/'+pId)
        .then(res=>{setComments(res.data)})
        .then(res=>setIsLoading(0))
    },[post])
    
    const child = (v) =>{
        setIsChild(v)
    }

    const userData = (i) => {
        
        axios.get('http://localhost:3000/user/'+i)
        .then(res=> setData(res.data))
        return data
    }
    const comment = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/comment',{comment:comm, pId:pId, id:props.id})
    }

    const cupvote = (id) =>{
        
        
        axios.patch('http://localhost:3000/cupvote/',{cid:id, id:props.id})
    }
    const cdownvote = (id) =>{
        axios.patch('http://localhost:3000/cdownvote/',{cid:id, id:props.id})
    }
    const ccomment = (id) =>{
        props.cid(id)
    }
    
    return(
        <div className='root'>
            <div>
            <h1>{post.title}</h1>
            <p>{post.content}</p>
            </div>
            <div>
            <form onSubmit={comment}>
                <textarea onChange={(e)=>{setComm(e.target.value)}} value={comm} placeholder='Write Something'>

                </textarea>
                <div>
                <button>Comment</button>
                </div>
            </form>
            </div>
            <div className='comments'>
                {comments.map(i=>{
                    return(
                    i.isChild==0?
                    <>
                    <hr></hr>
                    
                    <Comm pid={pId} cid={i.id} id={props.id} generation={0}/>
                    <hr></hr>
                    </>:console.log('child')
                )})}
            </div>
            
        </div>
    )
}
export default Post