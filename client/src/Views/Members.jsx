import React, { useEffect, useState,useContext} from 'react'
import {useParams} from "react-router-dom"
import AuthContext from '../Context/AuthProvider';
import axios from 'axios';
import {
    Routes,
    Route,
    Link
} from "react-router-dom";

const Members = (props) =>{
    const {commId} = useParams();
    const [status, setStatus] = useState(0);
    const [members, setMembers] = useState([])
    useEffect(()=>{
        axios.get('http://localhost:3000/members/'+commId)
        .then(res=>setMembers(res.data))
        axios.get('http://localhost:3000/getStatus/'+props.id+'/'+commId)
        .then(res=>{setStatus(res.data);console.log("status: " ,res.data)})
    },[])
    const delegate = (id) => {
        axios.patch('http://localhost:3000/delegate',{id:id,commId:commId})
    }


    return(
        <>
        <h1>Members</h1>
        <div>
            {status==1?
            members.map(i=>{
                console.log(i)
                if(i.isAdmin!=1){
                return (
                    <>
                    <button onClick={()=>{delegate(i.id)}}>Delegate</button>
                <Link to={"/profile/"+i.id}>{i.name}</Link>
                </>
                )}else{
                    return (
                        <>
                
                    <Link to={"/profile/"+i.id}>{i.name}</Link>
                    </>
                    )
                }
            })
            :
            members.map(i=>{
                return <Link to={"/profile/"+i.id}>{i.name}</Link>
            })}
        </div>
        </>
    )
}
export default Members