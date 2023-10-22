import React, { useEffect, useState,useContext} from 'react'
import AuthContext from '../Context/AuthProvider';
import axios from 'axios';
import {
    Routes,
    Route,
    Link
} from "react-router-dom";

const SignIn = (props) => {
    const {setAuth} = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [cpass, setCpass] = useState("");
    const [name,setName] = useState("");
    const [nemail,setNemail] = useState("");
    const [npass,setNpass] = useState("");
    useEffect(()=>{
        console.log('test')
      },[])
    const signIn = e =>{
        e.preventDefault();
        
        axios.post('http://localhost:3000/signin',{email,pass})
        .then(res=>{
            
            if(res.data.status == "success"){
                console.log(res.data.id)
                props.sck(res.data.id)
                console.log(res.data)
            }
        })
    }


    const signUp = e =>{
        e.preventDefault();
        if (cpass == npass){
        axios.post('http://localhost:3000/signup',{
            name,
            nemail,
            npass
        })}
    }

    return (
        <>
            <div>
                <h3>Sign In</h3>
                <form onSubmit={signIn}>
                    <input onChange={(e) => { setEmail(e.target.value) }} value={email} type="text" placeholder='Email'></input><br></br>
                    <input onChange={(e) => { setPass(e.target.value) }} value={pass} type="password" placeholder='Password'></input><br></br>
                    <button>Submit</button>

                </form>
            </div>

            <div>
                <h3>Sign Up</h3>
                <form onSubmit={signUp}>
                    <input onChange={(e) => { setName(e.target.value) }} value={name} type="text" placeholder='Name'></input><br></br>
                    <input onChange={(e) => { setNemail(e.target.value) }} value={nemail} type="text" placeholder='Email'></input><br></br>
                    <input onChange={(e) => { setNpass(e.target.value) }} value={npass} type="password" placeholder='Password'></input><br></br>
                    <input onChange={(e) => { setCpass(e.target.value) }} value={cpass} type="password" placeholder='Confirm Password'></input><br></br>
                    <button>Submit</button>
                </form>
            </div>
        </>
    )
}
export default SignIn