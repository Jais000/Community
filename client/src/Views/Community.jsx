import React, { useEffect, useState } from 'react'
import {useParams} from 'react-router-dom'
import axios from 'axios'
import DT from 'react-datetime'
import './css/Community.css'
import "react-datetime/css/react-datetime.css";
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import { Calendar } from '@fullcalendar/core';
import * as bootstrap from 'bootstrap';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Tippy from '@tippyjs/react';
import { usePopper } from 'react-popper';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import {Button, Modal} from 'react-bootstrap'

const eventss = [

]
const Community = (props) =>{
  const [once,setOnce] = useState(true)
  const [isGroup,setIsGroup] = useState(true)
  const [gId,setGId] = useState(0)
  const [su, setSu] = useState(false)
  const [mo, setMo] = useState(false)
  const [tu, setTu] = useState(false)
  const [we, setWe] = useState(false)
  const [th, setTh] = useState(false)
  const [fr, setFr] = useState(false)
  const [sa, setSa] = useState(false)
    const [day,setDay] = useState(true)
    const [isComm,setIsComm] = useState(0)
    const [desc,setDesc] = useState("")
    const [descDisp,setDescDisp] = useState("")
    const {commId} = useParams();
    const [status,setStatus] = useState(0)
    const [modalId , setModalId] = useState()
    const [strt,setStrt] = useState("")
    const [end,setEnd] = useState("")
    const [prv,setPrv] = useState(false)
    const [title,setTitle] = useState("")
    const [events,setEvents] = useState(eventss)
    const [memberWith,setMemberWith] = useState([])
    const [mutual,setMutual] = useState([])
    const [isLoading,setIsLoading] = useState(true)
    const [sTime,setSTime] = useState('10:00')
    const [eTime,setETime] = useState('10:00')
    useEffect(()=>{
        console.log("setId: ",props.id)
        console.log('http://localhost:3000/getStatus/'+props.id+'/'+commId)
        axios.get('http://localhost:3000/getCommEvents/'+ commId)
        .then(res=>{setEvents(res.data);console.log('events:',res);})
        axios.get('http://localhost:3000/getStatus/'+props.id+'/'+commId)
        .then(res=>{setStatus(res.data);console.log("status: " ,res.data)})
        axios.get('http://localhost:3000/member/'+props.id + '/'+commId)
        .then(res=>props.setMem(res.data))
    },[props.id])
    useEffect(()=>{
      axios.post('http://localhost:3000/mutuality/',{events:events,uid:props.id})
      .then(res=>setMutual(res.data))
      .then(setIsLoading(false))
    },[events])
    const create = (e) =>{      
      if(once==true){  
      axios.post('http://localhost:3000/createCommEvent',[{title:title,
      start: strt.toISOString().split('T')[0] +'T'+sTime,
      end:end.toISOString().split('T')[0] +'T'+eTime,
      allDay:day},commId,desc,prv])
        .then(res=>axios.get('http://localhost:3000/getCommEvents/'+ commId))
        .then(res=>setEvents(res.data))
      }else{multicreate()}
    } 
    const multicreate = () => {
      console.log('multicreating')
      axios.post('http://localhost:3000/createMultiCommEvent', [{ 
      title: title,
      start: strt.toISOString(),
      end: end.toISOString(),
      sTime: sTime,
      eTime: eTime,
      allDay: day }, commId, desc, prv, {su:su,mo:mo,tu:tu,we:we,th:th,fr:fr,sa:sa}])
    }
    const memberView=(eid) =>{
      axios.get('http://localhost:3000/memberView/'+eid+'/'+props.id)
      .then(res=>{setMemberWith(res.data[0].communes_id);console.log(memberWith)})
    }
    
    const add = ()=>{
        $("#addModal").modal('show')
    }
    const set = (info) =>{ 
        if(status==1){
        console.log(info.event.start)
        try{
          var eventObj 
        var eventObj = {
            extendedProps: {
                groupId : info.event.extendedProps.groupId,
                private: info.event.extendedProps.private,
                desc: info.event.extendedProps.desc,
                id: info.event.extendedProps.id
              },
            title:info.event.title,
            start:info.event.start.toISOString(),
            end: info.event.end.toISOString()
          }}
          
          catch(e){
            
            e.message.includes("Cannot read properties of null")?
            eventObj = {
            extendedProps: {
              groupId : info.event.extendedProps.groupId,
                private: info.event.extendedProps.private,
                desc: info.event.extendedProps.desc,
                id: info.event.extendedProps.id
              },
            title:info.event.title,
            start:info.event.start.toISOString(),
            end: info.event.start.toISOString()
            }:console.log('error')
              }
            axios.patch('http://localhost:3000/update',{event: JSON.stringify(eventObj) , eventId: info.event.extendedProps.id})
        }
    }
    const deleteMulti = () => {
      console.log('deleting ',gId)
      axios.delete('http://localhost:3000/deleteMultiComm/' + gId)
    }
    const reactClick = (e) => {
      var val=e;
      if(val.length==2){setStrt(val[0]);setEnd(val[1])}
        else{setStrt(val);setEnd(val)}
      console.log(e)
  
    }
    const del = () => {
        console.log("test")
        console.log(modalId)
        axios.delete('http://localhost:3000/delete/'+modalId)
    }
    if(isLoading==false){
    return (
        <div className='root'>
        <div style={{display:'flex'}}>
          <div className='comm_fullC'>
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
        eventChange={set}
        eventClick={(info)=>{
            $("#title").html(info.event.title)
            info.event.extendedProps.groupId? setIsGroup(true):setIsGroup(false)
            info.event.extendedProps.groupId? setGId(info.event.extendedProps.groupId):console.log('single')            
            $('#desc').html(info.event.desc)
            setDescDisp(JSON.stringify(info.event.extendedProps.desc))
            $('#modal-body').html(info.event.desc)
            setIsComm(info.event.extendedProps.isComm)
            setModalId(info.event.extendedProps.id)
            $("#myModal").modal('show')
        }}
        events = {events.filter((v,k)=>v.extendedProps.private==true?(mutual[k]==true?(true):(false)):(true))}
        editable = {true}
        />
        </div>
          <div className='comm_sidepanel'>
          <div>
          <ReactCalendar 
          onChange={(e)=>{reactClick(e);}} 
          value={[strt,end]}
          selectRange={true}
          onClickDay={reactClick}/>
          </div>
          <hr></hr>
          {status==1?<button onClick={add}>Add Event</button>:console.log('notadmin')}
          
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
        <p id="desc">text</p>
        {status==1?<button onClick = {del} >Delete Event</button>:console.log('notadmin')}
        {descDisp}
        {status == 1 && isGroup==true? <><button type="button" onClick={deleteMulti} class="btn btn-warning">Delete Reoccurring</button></>:console.log('not grouped and/or admin')}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div> 

<div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="titleId">Modal title</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">


        <form onSubmit={create}>
        <input onChange={(e)=>{setPrv(e.target.checked);console.log(e.target.checked)}} value={prv} class="form-check-input" type="checkbox"  id="flexCheckDefault"></input>
            <label class="form-check-label" for="flexCheckDefault">Private</label>
            <input onChange={(e)=>{setDay(e.target.checked);console.log(e.target.checked)}} value={day} class="form-check-input" type="checkbox" id="flexCheckDefault"></input>
            <label class="form-check-label" for="flexCheckDefault">All Day</label>
            <div>
            Title
            <input type="text" onChange={(e)=>{setTitle(e.target.value)}} value={title}></input>
            </div>

            <div>Date Range
                  <div display={{style:'flex'}}>
                    <div>Start
                    <DatePicker onChange={i=>setStrt(i)} selected={strt}/>
                    </div>
                    <div>End
                    <DatePicker onChange={i=>setEnd(i)} selected={end}/>
                    </div>
                  </div>
                </div>
                <div>Time Range
                  <div>
                    <div display={{style:'flex'}}>
                      <div>Start
                      <input type='time' onChange={e=>setSTime(e.target.value)} value={sTime}></input>
                      </div>
                      <div>End
                      <input type='time' onChange={e=>setETime(e.target.value)} value={eTime}></input>
                      </div>
                    </div>
                  </div>
                </div>
            <div>
            Description
            <textarea onChange={(e)=>{setDesc(e.target.value)}} value={desc}></textarea>
            </div>
            <button onClick={create} type="button">Submit</button>
            <div className='calendar_reoccurring'>
                  Reoccurrence
                  <div style={{display:"flex", justifyContent:"space-around"}}>
                    
                    <div >
                        One Day<input onChange={e => {if(once == true){setOnce(e.target.checked)}else{setSu(false);setMo(false);setTu(false);setWe(false);setTh(false);setFr(false);setSa(false);setOnce(e.target.checked)} }} value={su} class="form-check-input" type="checkbox" checked={once} id="flexCheckDefault"></input>
                      </div>
                    
                    <div className='calendar_reoccurring_days'>
                      <div>
                        Su.<input onChange={e => { if(su==false){setSu(e.target.checked);setOnce(false)}else{setSu(e.target.checked)} }} checked={su} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                      <div>
                        Mo.<input onChange={e => { if(mo==false){setMo(e.target.checked);setOnce(false)}else{setMo(e.target.checked)} }} checked={mo} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                      <div>
                        Tu.<input onChange={e => { if(tu==false){setTu(e.target.checked);setOnce(false)}else{setTu(e.target.checked)} }} checked={tu} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                      <div>
                        We.<input onChange={e => { if(we==false){setWe(e.target.checked);setOnce(false)}else{setWe(e.target.checked)} }} checked={we} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                      <div>
                        Th.<input onChange={e => { if(th==false){setTh(e.target.checked);setOnce(false)}else{setTh(e.target.checked)} }} checked={th} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                      <div>
                        Fr.<input onChange={e => { if(fr==false){setFr(e.target.checked);setOnce(false)}else{setFr(e.target.checked)} }} checked={fr} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                      <div>
                        Sa.<input onChange={e => { if(sa==false){setSa(e.target.checked);setOnce(false)}else{setSa(e.target.checked)} }} checked={sa} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                      </div>
                    </div>
                  </div>
                </div>        
        
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        
      </div>
    </div>
  </div>
</div> 



      </div>
    )}else{
      return(
        <h1>Loading</h1>
      )
    }
}
export default Community
