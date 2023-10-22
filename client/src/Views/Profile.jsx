import React, { useEffect, useState,useContext} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Profile.css'
import {useParams} from "react-router-dom"
import AuthContext from '../Context/AuthProvider';
import axios from 'axios';
import {
    Routes,
    Route,
    Link
} from "react-router-dom";
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import { useRef } from 'react';

const Profile = (props) => {
    var eventss = []
    const [prv,setPrv] = useState(false)
    const [isComm,setIsComm] = useState(0)
    const [startDisp,setStartDisp] = useState("")
    const [endDisp,setEndDisp] = useState("")
    const [descDisp,setDescDisp] = useState("") 
    const [status,setStatus] = useState(0)
    const [modalId , setModalId] = useState()
    const [strt,setStrt] = useState("")
    const [end,setEnd] = useState("")
    const [title,setTitle] = useState("")
    const [events,setEvents] = useState(eventss)
    const [day,setDay] = useState(true)
    const [comms,setComms] = useState([])
    const [desc,setDesc] = useState("")
    const [user, setUser] = useState({})
    const {id} = useParams();
    const [mutual,setMutual] = useState([])
    const [fstatus, setFStatus] = useState(1);
    const [isLoading,setIsLoading] = useState(true)
    const ref = useRef(0);
    useEffect(()=>{
        axios.get('http://localhost:3000/getCommunities/'+id)
        .then(res=>setComms(res.data))
        axios.get('http://localhost:3000/user/'+id)
        .then(res=>{setUser(res.data[0])})
        .then(res=>axios.get('http://localhost:3000/fstatus/'+id+'/'+props.id))
        .then(res => setFStatus(res.data))
        .then(res=>axios.get('http://localhost:3000/getUserEvents/'+ id))
        .then((res)=>{res.data.map(i=>i.event.extendedProps.status = i.status)
                    res.data.map(i=>i.event.extendedProps.isComm = i.isCommEvent)
                    console.log('events: ',res.data.map(i=>i.event.extendedProps))
                    setEvents(res.data);
                    }).catch((err) => console.log(err))

    
                },[])
    useEffect(()=>{
        console.log(events)
        axios.post('http://localhost:3000/mutuality/',{events:events.map(i=>i.event),uid:props.id})
        .then((res)=>{setMutual(res.data)
            events.map((i,k)=>i.event.extendedProps.mutual=mutual[k])
            }).catch((err) => console.log(err))      
      },[events])

    const refMutual = (mut) => {
        ref.current = mut
    }
   
    const add = () => {
        axios.post('http://localhost:3000/add/',{toid:id,fromid:props.id})
        
    }
    
    if(events.map(i=>i.event.extendedProps.mutual)[0]==undefined && events.length>0){
      console.log(events)
        axios.post('http://localhost:3000/mutuality/',{events:events.map(i=>i.event),uid:props.id})
        .then((res)=>{setMutual(res.data)
            events.map((i,k)=>i.event.extendedProps.mutual=mutual[k])
            }).catch((err) => console.log(err))    
    
    }else{
    return (
        <div className='root'>
        
        <div className='prof_body' display={{style:"flex"}}>
      <div className='fullC'>
        <FullCalendar
       plugins={[ dayGridPlugin,interactionPlugin,timeGridPlugin  ]}
       initialView="dayGridMonth"
       headerToolbar={{
           id:"test",
           start: "title",
           center:"today prev,next",
           end:"dayGridMonth,timeGridWeek,timeGridDay"
       }}
       selectable
       eventClick={(info)=>{
         
           setStartDisp(JSON.stringify(info.event.start))
           setEndDisp(JSON.stringify(info.event.end))
           setStatus(info.event.extendedProps.status)
           setDescDisp(JSON.stringify(info.event.extendedProps.desc))
           setIsComm(info.event.extendedProps.isComm)
           
           $("#title").html(info.event.title)
           setModalId(info.event.extendedProps.id)
           $("#myModal").modal('show')

       }}
       
       events = {events.filter((v)=>v.event.extendedProps.private==true?(v.event.extendedProps.mutual==true?(true):(false)):(true)).map(i=>i.event)}
       editable = {true}
        />
        </div>
          <div className='prof_sidepanel'>
          {comms.map(i=>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" ></input>
            <label class="form-check-label" for="flexSwitchCheckDefault">{i.name}</label>
          </div>
            )}
          <hr></hr>

        {fstatus==1?(console.log('friend')):(<button onClick={add}>Add Contact</button>)}
        <Link to={'/Messenge/'+id}>Send Message</Link>
        </div>
        </div>

          





        <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="title">Modal title</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        
        
        <div style={{display:"flex"}}>
          <p>{startDisp}</p>
          {endDisp=='null'? console.log('noend'):<p>{endDisp}</p>}
          {descDisp}
        </div>
        
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        
      </div>
    </div>
  </div>
</div> 
        </div>
    )
}
    
}
export default Profile