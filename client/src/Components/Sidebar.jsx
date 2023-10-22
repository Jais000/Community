import React, { useEffect, useState } from 'react'
import {useParams} from "react-router-dom"
import {  useLocation } from 'react-router-dom';
import './CSS/Sidebar.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
const Sidebar = (props) => {



    const [isMember,setIsMember] = useState(0);
    const loc = useLocation().pathname
    const leave = () =>{
        axios.delete('http://localhost:3000/leave/'+props.id+'/'+loc.split('/')[2])
    }
    const join = () =>{
    axios.post('http://localhost:3000/join',{userId:props.id,commId:loc.split('/')[2]})
   }

    return(
    <div className="container">
        <Link to={'/'}>Your View</Link>
        <Link to={'/Communities/'}>Your Communities</Link>
        <Link to={'/Contacts'}>Your Contacts</Link>
        <Link to={'/Messages'}>Messages</Link>
        <Link to={'/CreateCommunity'}>Create Community</Link>
        {props.isComm == 1?(props.isMem == 0? (<>
                                                <Link to={'/Forum'+loc.split('/')[2]}>Forum</Link>
                                                <Link to={'/Members/'+loc.split('/')[2]}>View Members</Link>
                                                <button onClick={join}>Join Community</button>
                                                
                                                </>):(
                                                <>
                                                <Link to={'/Forum/'+loc.split('/')[2]}>Forum</Link>
                                                <Link to={'/Members/'+loc.split('/')[2]}>View Members</Link>
                                                <button onClick={leave}>Leave Community</button>
                                                </>)):(console.log('notcommunity'))}
        
    </div>
)
}
export default Sidebar
