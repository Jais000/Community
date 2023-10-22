import React, { useEffect, useState } from 'react'
import './css/Communities.css'
import axios from 'axios';
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
const Communities = (props) => {

  const [comms,setComms] = useState([]);
    useEffect(()=>{
        axios.get('http://localhost:3000/getCommunities/'+ props.id)
        .then(res=>{setComms(res.data)})
      },[])

return(
  <div className='root'>
  <h1>Your Communities</h1>
    <div className='communities_body'>
    {comms.map((i,j)=>{
        console.log(i)
        return <Link key={j} to={'/Community/'+i.id}>{i.name}</Link>
      })}
    </div>
  </div>
)
}
export default Communities
