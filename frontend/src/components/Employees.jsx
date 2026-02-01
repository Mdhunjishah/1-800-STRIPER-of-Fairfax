import React from 'react'
import api from "../lib/axios"
import './Employees.css'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

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
        const confirmDelete = window.confirm("Would you like to delete this Employee?")
        if(!confirmDelete)
            return

        const loc = e.target.parentElement.id
        const loadingToast = toast.loading("loading")
        
        api.delete("/employee", { data : { id: data[loc]._id} })
            .then((res) => {
                let newData = [...data]
                newData.splice(loc, 1)
                setData(newData)

                toast.remove(loadingToast)
                toast.success("Employee Deleted")
            })
            .catch((error) => {
                toast.remove(loadingToast)
                toast.error("Sorry, the Employee couldn\'t be deleted")
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
                            <tr id={i} className="employeeTr" key={i}>
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
            <Toaster/>
        </div>
        
    )
}

export default Employees
