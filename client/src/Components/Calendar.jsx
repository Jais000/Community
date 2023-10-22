import React, { useEffect, useState } from 'react'
import '../Views/css/Calendar.css'
import axios from 'axios'
import DT from 'react-datetime'
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
import MyModal from './modal';
import { Button, FormCheck, Modal } from 'react-bootstrap'
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
const eventss = [

]
const Month = (props) => {
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
  const [info, setInfo] = useState({})
  const [isComm, setIsComm] = useState(0)
  const [startDisp, setStartDisp] = useState("")
  const [endDisp, setEndDisp] = useState("")
  const [descDisp, setDescDisp] = useState("")
  const [status, setStatus] = useState(0)
  const [modalId, setModalId] = useState()
  const [strt, setStrt] = useState("")
  const [end, setEnd] = useState("")
  const [title, setTitle] = useState("")
  const [events, setEvents] = useState(eventss)
  const [day, setDay] = useState(true)
  const [desc, setDesc] = useState("")
  const [yours, setYours] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [comms, setComms] = useState([])
  const [hidden, setHidden] = useState(false)
  const [hideEvents, setHideEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sTime,setSTime] = useState('10:00')
  const [eTime,setETime] = useState('10:00')
  useEffect(() => {
    axios.get('http://localhost:3000/getCommunities/' + props.id)
      .then(res => setComms(res.data))
    axios.get('http://localhost:3000/getUserEvents/' + props.id)
      .then(res => {
        res.data.map(i => i.event.extendedProps.status = i.status)
        res.data.map(i => i.event.extendedProps.isComm = i.isCommEvent)
        setEvents(res.data)
      })
      .then(res => events.map(i => { return ({ ...i, event: { ...i.event, extendedProps: { ...i.event.extendedProps, hidden: hidden } } }) }))
  }, [props.id])

  const create = () => {
    console.log(end)
    
    if(once==true){

      axios.post('http://localhost:3000/createevent', [{ 
    title: title,
     start: strt.toISOString().split('T')[0] +'T'+sTime,
      end: end.toISOString().split('T')[0] +'T'+eTime,
       allDay: day },
       props.id, desc, privacy])
      .then(res => axios.get('http://localhost:3000/getUserEvents/' + id))
      .then(res => setEvents(res.data))
    setEvents(events.map(i => { return ({ ...i, event: { ...i.event, extendedProps: { ...i.event.extendedProps, hidden: false } } }) }))  
    }else{multicreate()}
  }

  const multicreate = () => {
    console.log('multicreating')
    axios.post('http://localhost:3000/createMultiEvent', [
      { title: title,
         start: strt.toISOString(),
          end: end.toISOString(),
          sTime: sTime,
          eTime: eTime,
           allDay: day }, props.id, desc, privacy, {su:su,mo:mo,tu:tu,we:we,th:th,fr:fr,sa:sa}])
  }

  const hide = async (e, id) => {
    console.log(e.target.checked)

    setHidden(e.target.checked)
    axios.get('http://localhost:3000/getCommEvents/' + id)
      .then(res => setEvents(events.map(i => res.data.map(j => j.extendedProps.id).includes(i.event.extendedProps.id) ?
        { ...i, event: { ...i.event, extendedProps: { ...i.event.extendedProps, hidden: hidden } } } : i)))
      .then(res => console.log('hiddenstat', events.map(i => i.event.extendedProps.hidden)))
  }
  const add = () => {
    $("#addModal").modal('show')
  }

  const set = (info) => {
    console.log('info: ',info)
    if (info.event.extendedProps.status == 1) {
      try {
        var eventObj = {}
        var eventObj = {
          extendedProps: {
            groupId:gId,
            private: !privacy,
            id: info.event.extendedProps.id,
            desc: info.event.extendedProps.desc,
            hidden: info.event.extendedProps.hidden
          },

          title: info.event.title,
          start: info.event.start.toISOString(),
          end: info.event.end.toISOString()
        }
      }

      catch (e) {
        var eventObj
        console.log(privacy)
        e.message.includes("Cannot read properties of null") ?

          eventObj = {
            extendedProps: {
              groupId:gId,
              hidden: hidden,
              private: !privacy,
              id: info.event.extendedProps.id,
              desc: info.event.extendedProps.desc,
              hidden: info.event.extendedProps.hidden
            },
            title: info.event.title,
            start: info.event.start.toISOString(),
            end: info.event.start.toISOString()
          } : console.log('error')
      }
      console.log(eventObj)
      axios.patch('http://localhost:3000/update', { event: JSON.stringify(eventObj), eventId: info.event.extendedProps.id })
        .then(console.log('patched'))
    }
  }

  const deleteMulti = () => {
    console.log('deleting ',gId)
    axios.delete('http://localhost:3000/deleteMulti/' + gId)
  }
  const del = () => {
    axios.delete('http://localhost:3000/delete/' + modalId)
  }
  const reactClick = (e) => {
    var val=e;
    if(val.length==2){setStrt(val[0]);setEnd(val[1])}
      else{setStrt(val);setEnd(val)}
    console.log(e)

  }
  console.log(events)
  return (
    <>
      <div className='uprof_body'>
      <div className='fullC'>
        <FullCalendar className="fc"
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            id: "test",
            start: "title",
            center: "today prev,next",
            end: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          timeZone='UTC'
          selectable
          eventChange={(e)=>{set(e)}}
          eventClick={(info) => {
            setInfo(info)
            console.log(info)
            info.event.extendedProps.groupId? setIsGroup(true):setIsGroup(false)
            info.event.extendedProps.groupId? setGId(info.event.extendedProps.groupId):console.log('single')
            setPrivacy(info.event.extendedProps.private)
            setStartDisp(JSON.stringify(info.event.start))
            setEndDisp(JSON.stringify(info.event.end))
            setStatus(info.event.extendedProps.status)
            setDescDisp(JSON.stringify(info.event.extendedProps.desc))
            setIsComm(info.event.extendedProps.isComm)
            $("#title").html(info.event.title)
            setModalId(info.event.extendedProps.id)
            $("#myModal").modal('show')


          }}
          events={events.map(i => i.event)}
          editable={true}
        />
        </div>
        <div className='sidepanel'>
          <div>
          <ReactCalendar 
          onChange={(e)=>{reactClick(e);}} 
          value={[strt,end]}
          selectRange={true}
          onClickDay={reactClick}/>
          </div>
          {
          comms.map(i => <div class="form-check form-switch">
            <input onChange={(e) => { hide(e, i.id) }} class="form-check-input" type="checkbox" id="flexSwitchCheckDefault" ></input>
            <label class="form-check-label" for="flexSwitchCheckDefault">{i.name}</label>
          </div>)
          }
          <hr></hr>
          <button onClick={add}>Add Event</button>
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


              <input onChange={(e) => { setPrivacy(e.target.checked); set(info) }} checked={privacy} class="form-check-input" type="checkbox" id="flexCheckDefault"></input>
              <label class="form-check-label" for="flexCheckDefault">Private</label>
              <div style={{ display: "flex" }}>
                <p>{startDisp}</p>
                {endDisp == 'null' ? console.log('noend') : <p>{endDisp}</p>}
                {descDisp}
              </div>
              {status == 1 ?( <button onClick={del} >Delete Event</button> ): console.log('notadmin')}
              {status == 1 && isGroup==true? <><button type="button" onClick={deleteMulti} class="btn btn-warning">Delete Reoccurring</button></>:console.log('not grouped and/or admin')}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

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


              <form>
                <input onChange={(e) => { setPrivacy(e.target.checked) }} checked={privacy} class="form-check-input" type="checkbox" value="" id="flexCheckDefault"></input>
                <label class="form-check-label" for="flexCheckDefault">Private</label>
                <input onChange={(e) => { setDay(e.target.checked) }} value={day} class="form-check-input" type="checkbox" id="flexCheckDefault"></input>
                <label class="form-check-label" for="flexCheckDefault">All Day</label>
                <div>
                  Title
                  <input type="text" onChange={(e) => { setTitle(e.target.value)}} value={title}></input>
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
                  <textarea onChange={(e) => { setDesc(e.target.value) }} value={desc}></textarea>
                </div>
                
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
                <button onClick={create} type="button">Submit</button>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

            </div>
          </div>
        </div>
      </div>


    </>
  )
}
export default Month


