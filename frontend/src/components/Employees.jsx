import React from 'react'
import api from "../lib/axios"
import './Employees.css'
import { useState, useEffect } from 'react'

const Employees = ({ user, setUser }) => {
    const [data, setData] = useState([])

    useEffect(() => {
        api.get("/employee")
            .then((res) => {
                setData(res.data.data)
            })
    }, [])

     const typeColorDict = {
        "Editor": "#8DD7BF",
        "Admin": "#ff8e8e",
    }

    function permissionChange(e){
        const loc = e.target.id
        let newPermission = 'Admin'
        if(data[loc].permission === 'Admin')
            newPermission = 'Editor'


        api.put("/employee", { id: data[loc]._id, update: {permission: newPermission} })
            .then((res) => {
                let newData = [...data]
                newData[loc] = res.data.data
                setData(newData)

                if(res.data.data._id === user._id)
                    setUser(res.data.data)
            })
            .catch((error) => {
                console.log(error)
            })

    }

    function deleteEmployee(e){
        const loc = e.target.parentElement.id

        api.delete("/employee", { data : { id: data[loc]._id} })
            .then((res) => {
                let newData = [...data]
                newData.splice(loc, 1)
                setData(newData)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    return (
        <div>
            <div id="employeeContentContainer">
                <h2 id="employeeTableTitle">Employees:</h2>
                <div id="tableContainer">
                    <table id="employeeTable">
                        <thead>
                            <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Permission</th>
                            <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((obj, i) => (
                            <tr id={i} key={i}>
                                <td>{`${obj.first_name} ${obj.last_name}`}</td>
                                <td>{obj.email}</td>
                                {/* <td><div className="colorCell" style={{backgroundColor: typeColorDict[obj.permission]}}>{obj.permission}</div></td> */}
                                <td>
                                    <div>
                                        <select id={i} defaultValue={obj.permission} style={{backgroundColor: typeColorDict[obj.permission]}} onChange={permissionChange}>
                                            <option value="Admin">Admin</option>
                                            <option value="Editor">Editor</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="deleteCell" onClick={deleteEmployee}>❌</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>    
                </div>
            </div> 
        </div>
        
    )
}

export default Employees
