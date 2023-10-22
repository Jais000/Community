import React, { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {  useLocation } from 'react-router-dom';
import './App.css'
import axios from 'axios';
import Home from './Views/Home';
import Header from './Views/Header';
import Index from './Views/Index';
import { BrowserRouter } from 'react-router-dom'
import {
  Routes,
  Route,
  Link
} from "react-router-dom";
import SignIn from './Views/SignIn';
import Week from './Components/Week';
import Calendar from './Components/Calendar';
import Sidebar from './Components/Sidebar';
import Contacts from './Views/Contacts';
import Communities from './Views/Communities';
import Community from './Views/Community';
import CreateCommunity from './Views/CreateCommunity';
import Search from './Views/Search';
import Members from './Views/Members';
import Profile from './Views/Profile';
import Messenge from './Views/Messenge';
import Messages from './Views/Messages';
import Message from './Views/Message'; 
import Forum from './Views/Forum';
import MakePost from './Views/MakePost';
import Post from './Views/Post';
import CComment from './Views/cComment';

function App() {
const location = useLocation();
const loc = location.pathname
const [cId,setCId] = useState(0)
const [isForum,setIsForum] = useState(0);
const [toMessage,setToMessage] = useState(0);
const [isMem,setIsMem] = useState(0)
const [cookieId,setCookieId] = useState(0)
const [isComm,setisComm] = useState(0)
const setcookie = (ck) =>{
  setCookieId(ck)
}
const setToMess = (e) => {
  setToMessage(e)
}
const setForum = (e) =>{
  setIsForum(e)
}
const setMem = (e) =>{
  setIsMem(e)
}
const cCom = (e)=>{
  setCId(e)
}
useEffect(()=>{
  axios.get('http://localhost:3000/session')
  .then(res=>{setCookieId(res.data.Id);})
  .then(res=>console.log("cookieId: ",cookieId))
  
},[cookieId])

  
  
  return (
    <>
      <Header id = {cookieId} isComm= {isComm} sck={setcookie}/>
      <div className='body'>
      {cookieId == undefined?(console.log('notloggedin')):
                              (loc.includes('Community/')?(<Sidebar isFor = {setForum} for={isForum} isMem={isMem} isComm={1} id={cookieId} />):
                              (<Sidebar isComm={0} id={cookieId} />))}
      
      <Routes>
        <Route path="/" element={cookieId == undefined?(<Index cookieId={cookieId}/>):(<><Home id={cookieId} /></>)}/>
        <Route path="/SignIn" element={<SignIn sck={setcookie} />} />
        <Route path='/month' element={<Calendar />}/>
        <Route path='/week' element={<Week/>}/>
        <Route path = '/Communities' element={<Communities  id = {cookieId}/>}/> 
        <Route path = '/Contacts' element={<Contacts id = {cookieId}/>}/>
        <Route path = '/Community/:commId' element={<Community setMem={setMem} id={cookieId}/>}/>
        <Route path = '/CreateCommunity' element={<CreateCommunity id={cookieId}/>}/>
        <Route path = '/Search/:search' element={<Search id={cookieId}/>}/>
        <Route path = '/Members/:commId' element={<Members id={cookieId}/>}/>
        <Route path = '/Profile/:id' element={<Profile id={cookieId}/>}/>
        <Route path = '/Messenge/:toid' element={<Messenge id={cookieId}/>}/>
        <Route path = '/Messages/' element={<Messages message_id={setToMess} id={cookieId}/>}/>
        <Route path = '/Message/' element={<Message mId ={toMessage} id={cookieId}/>}/>
        <Route path = '/Forum/:commId' element={<Forum id={cookieId}/>}/>
        <Route path = '/MakePost/:commId/:fId' element={<MakePost id={cookieId}/>}/>
        <Route path = '/post/:commId/:fId/:pId' element={<Post cid={cCom} id={cookieId}/>}/>
        <Route path = '/Comment/:pid/:cid' element={<CComment pid={cId} id={cookieId}/>}/>
      </Routes>
      </div>
    </>
  )
}

export default App
