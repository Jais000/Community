import React, { useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import {
    Routes,
    Route,
    Link
  } from "react-router-dom";
import axios from 'axios'
const Search = (props) => {
    const {search} = useParams();
    const [seek,setSeek] = useState([])
    useEffect(()=>{
        
        axios.get('http://localhost:3000/search/'+search)
        .then(res=>{setSeek(res.data);console.log('search: ',seek);})
    },[search])


return(
    <>
    <div>
    <h1>Find a Community</h1>
    </div>
    <div>
        {seek.map(i=>{
            console.log(i.id);
            return <Link to={'/Community/'+i.id}>{i.name}</Link>
        })}
    </div>
    </>
)
}
export default Search
