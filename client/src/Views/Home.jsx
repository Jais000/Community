import React, { useEffect, useState } from 'react'
import axios from 'axios';
import {
  Routes,
  Route,
  Link
} from "react-router-dom";
import './css/Home.css'
import Month from '../Components/Calendar';

const Home = (props)=> {
    const [email,setEmail] = useState("");
    useEffect(()=>{
        axios.get('http://localhost:3000/session')
        .then(res=>{
            console.log(res.data.Email)
            setEmail(res.data.Email)
        },[])
    })
        return(
            <div className="root">
                    <Month id={props.id}/>
            </div>
        )
    }
export default Home