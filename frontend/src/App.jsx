import React, { useState, useEffect } from 'react'
import api from "./lib/axios"
import './App.css'
import Navbar from './components/Navbar'
import Estimates from './components/Estimates'
import Employees from './components/Employees'
import SignIn from './components/SignIn'

const App = () => {
  const [user, setUser] = useState(null)
  const [content, setContent] = useState("Estimates")
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const id = getCookie("id")
    if(id){
      api.get(`/employee/${id}`)
        .then((res) => {
          setUser(res.data.data)
          setSignedIn(true)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [])
  
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/`;
  }

  function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    name = name + "=";
    for (let c of cookies) {
        c = c.trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=none; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  
  function signUserIn(user_info){
    setCookie("id", user_info._id, 30)
    setUser(user_info)
    setSignedIn(true)
  }

  function logUserOut(){
    setSignedIn(false)
    deleteCookie("id")
  }

  return (
    <div id="appContainer">
      {signedIn ? (
        <div>
          <Navbar user={user} setContent={setContent} logUserOut={logUserOut}/>
          {(content === "Estimates" || user.permission != 'Admin') ? <Estimates permission={user.permission}/> : <Employees user={user} setUser={setUser}/>}
        </div>
        
      ) : <SignIn signUserIn={signUserIn}/>}
      
    </div>
  )
}

export default App
