import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import './CSS/comm.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
const Comm = (props) => {

    const child = (v) =>{
        setIsChild(v)
    }


    const cupvote = (id) =>{
        axios.patch('http://localhost:3000/cupvote/',{cid:id, id:props.id})
    }
    const cdownvote = (id) =>{
        axios.patch('http://localhost:3000/cdownvote/',{cid:id, id:props.id})
    }
    const [gen,setGen] = useState(0)
    const [isChild,setIsChild] = useState(false)
    const [cId,setcId] = useState([]) 
    const [comment,setComment] = useState({})
    const [isLoading,setIsLoading] = useState(1)
    const [isShowing,setIsShowing] = useState(false)
    const showToggle = () =>{
        if(isShowing==true){setIsShowing(false)}
        else if(isShowing==false){setIsShowing(true)}
    }
    useEffect(()=>{
        setGen(props.generation)
        axios.get('http://localhost:3000/child/'+props.cid)
        .then(res=>setIsChild(res.data))
        console.log('running effect')
        axios.get('http://localhost:3000/commentchain/'+props.cid)
        .then(res=>setcId(res.data.map((comm) => comm.ccomment)))
        axios.get('http://localhost:3000/getComment/'+props.cid)
        .then(res=>{setComment(res.data)})
        .then(res=>setIsLoading(0))
    },[props])
    console.log(comment)
    if (isLoading==0){
        return(
           
        <div className='root'>
        

                <div style={{position:"relative",left:`${gen*30}px`}}>
                    <div className='post_comment'>
                        <div className='post_comment_votes'>
                            {comment[0].votes}
                        </div>
                        <div className="post_comment_body">
                            <div className='post_comment_content'>
                                {comment[0].content}
                            </div>
                            <div className='post_comment_user'>
                                <Link to = {'/profile/'+comment[0].users_id}>{comment[0].name}</Link>
                            </div>

                            <div className='post_voting'>
                            <button onClick={()=>cupvote(props.cid)} type="button" class="btn btn-secondary btn-sm">🡅</button>
                            <button onClick={()=>cdownvote(props.cid)} type="button" class="btn btn-secondary btn-sm">🡇</button>
                            </div>
                            <div>
                            <div><Link onClick={() => ccomment(i.id)} to={'/Comment/'+props.pid+'/'+ props.cid}>Comment</Link></div>
                            {comment[0].isParent ==1 ?(<button onClick={showToggle}>Toggle Comments</button>):(console.log('notparent'))}</div>
                            
                        </div>
                    </div>
                </div>
                {isShowing == true?
                        (   
                    
                    <div style={{position:"relative",left:`${gen*30}px`}}>

                        {cId.map(i=><Comm pid = {props.pid} cid={i} id={props.id} generation={props.generation+1}/>)}
                    </div>
                
            ):console.log('notShowing')
         }
        </div>
        )
    }
}
export default Comm