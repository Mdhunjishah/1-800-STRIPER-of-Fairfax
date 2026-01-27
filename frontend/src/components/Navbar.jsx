import React from 'react'
import './Navbar.css' 
import { useState } from 'react'

const Navbar = ({ user, setContent, logUserOut }) => {
  const [selected, setSelected] = useState("estimateBtn")

  const changeContent = (e) => {
    if(e.target.id == selected)
      return

    document.getElementById(selected).className = "contentButtons"
    document.getElementById(e.target.id).className = "contentButtons selected"

    setSelected(e.target.id)

    if(e.target.id == "estimateBtn")
      setContent("Estimates")
    else if(e.target.id == "employeeBtn")
      setContent("Employee")
  }

  return (
    <div id="navbar">
      <img id="logoImg" src="https://1800striper.com/wp-content/uploads/2023/02/1800striper_stacked.png"></img>

      <div>
        {user.permission === 'Admin' ? 
          <div id="buttonsContainer">
            <button id="employeeBtn" className="contentButtons" onClick={changeContent}>Employees</button>
            <button id="estimateBtn" className="contentButtons selected" onClick={changeContent}>Estimates</button>
          </div> : <h2 id="estimateText">Estimates</h2>}
           
        
          
      </div>
      
      
      <div id="rightContainer">
        <h2 id="helloText">Hello, {user.first_name}</h2>
        <div id="lineSeparator"></div>
        <button id="logOutButton" onClick={logUserOut}>Log Out</button>
      </div>
      
    </div>
  )
}
export default Navbar
