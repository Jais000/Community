import React, { useEffect, useState } from 'react'
import './css/Communities.css'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
const Contacts = (props) => {

useEffect(()=>{
  axios.get('http://localhost:3000/contacts/'+ props.id)
  .then(res=>setContacts(res.data))
},[])
const [contacts,setContacts] = useState([])
return(
  <div className='root'>
<h1>Your Contacts</h1>
<div className='contacts_body'>
  {contacts.map((i,j)=>{
    
    return <div> <Link key={j}to={'/Profile/'+i.id}>{i.name}</Link></div>
    
  })}
</div>
</div>
)
}
export default Contacts
