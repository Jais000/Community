import React, { useEffect, useState, useContext } from 'react'
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import {
    Routes,
    Route,
    Link
} from "react-router-dom";

import './CSS/Week.css'

const Week = () => {
    const [date,setDate] = useState("")
    const [dayOfWeek,setDayOfWeek] = useState(0)
    const [week,setWeek] = useState([])
    useEffect(()=>{
        
        axios.get('http://localhost:3000/date')
        .then(res=>{setDate(res.data)
        console.log('http://localhost:3000/weekday/'+ date)})
        axios.get('http://localhost:3000/weekday/'+ date)
        .then(res=>{setDayOfWeek(parseInt(res.data)-1)
            console.log(res)})
        var year = date.split('-')[0]
        var month = parseInt(date.split('-')[1]) -1  
        var day = parseInt(date.split('-')[2])
        
        for(var i = 0;i<7;i++){
            week.push(day + (i-dayOfWeek))
        }
        console.log(week)
    },[week])
    var data = {
        January: 31,
        February: 28,
        March: 31,
        April: 30,
        May: 31,
        June: 30,
        July: 31,
        August: 31,
        September: 30,
        October: 31,
        November: 30,
        December: 31,
    }
   var cnt = 0; 
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    

    return (
        <>
            <h1>Your Week</h1>
            <Link to={'/month'}>Month</Link>
            <div className='Week'>
                {[...Array(7).keys()].map(i => {
                    return (<div className='weekday'><div>{days[i]}, {week[i]}</div>
                        {[...Array(24).keys()].map(j=>{



                        })}
                    </div>)
                })}
            </div>
            <Communities />
            <Contacts />
        </>
    )
}
export default Week
