import React from 'react'
import api from "../lib/axios"
import './Estimates.css'
import { useState, useEffect } from 'react'
import EstimateForm from './EstimateForm'

const LIMIT = 50

const Estimates = ({ permission }) => {
    const [data, setData] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [formInfo, setFormInfo] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [moreData, setMoreData] = useState(true)

    useEffect(() => {
        refreshTable()
    }, [])

    useEffect(() => {
        refreshTable()
    }, [pageNumber])

    function formatDate(dateString){
        let date = new Date(dateString)
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }

    const typeColorDict = {
        "Interior": "#00A5E3",
        "Restripe": "#8DD7BF",
        "Re-layout": "#FFBF65",
        "New Layout": "#ff8e8e",
        "Sports Court": "#FFEC59",
        "Other": "#c27dcf",
        "Provided": "#8DD7BF",
        "Approved": "#00A5E3",
        "Waiting on Sub": "#FFBF65",
        "Lost": "#ff8e8e",
        "Requested": "#FFEC59",
        "In Progress": "#d0ebf3",
        "All": "lightyellow"
    }

    function typeInFilter(type, filter){
        if(filter === "All" || filter === type)
            return true
        return false
    }

    function statusInFilter(status, filter){
        if(filter === "All" || (filter === "In Progress" && (status != "Provided" && status != "Lost")) || filter === status)
            return true
        return false
    }

    function estimateCreated(estimateData){
        api.post("/estimate", estimateData)
            .then((res) => {
                const typeFilter = document.getElementById("typeFilter").value
                const statusFilter = document.getElementById("statusFilter").value
                if(typeInFilter(estimateData.type, typeFilter) && statusInFilter(estimateData.status, statusFilter)){
                    if(pageNumber === 1){
                        if(data.length === LIMIT){
                            setData(prev => [res.data.data, ...prev.slice(0, LIMIT - 1)])
                            if(!moreData)
                                setMoreData(true)
                        } else {
                            setData(prev => [res.data.data, ...prev])  
                        }
                    } else {
                        setPageNumber(1)
                    }
                } else {
                    if(!typeInFilter(estimateData.type, typeFilter))
                        document.getElementById("typeFilter").value = "All"
                    if(!statusInFilter(estimateData.status, statusFilter)){
                        if(statusInFilter(estimateData.status, "In Progress"))
                            document.getElementById("statusFilter").value = "In Progress"
                        else
                            document.getElementById("statusFilter").value = "All"
                    }
                    if(pageNumber === 1)
                        refreshTable()
                    else
                        setPageNumber(1)
                }

                setShowForm(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    function estimateUpdated(updateData){
        api.put("/estimate", { id: data[formInfo]._id,update: updateData })
            .then((res) => {
                const typeFilter = document.getElementById("typeFilter").value
                const statusFilter = document.getElementById("statusFilter").value
                const estimateType = updateData.type || data[formInfo].type
                const estimateStatus = updateData.status || data[formInfo].status
                
                if(typeInFilter(estimateType, typeFilter) && statusInFilter(estimateStatus, statusFilter)){
                    const sort = document.getElementById("sortBy").value
                    if(sort === "Status Updated" && updateData.status){
                        if(pageNumber === 1){
                            let newData = [res.data.data, ...data.slice(0, formInfo), ...data.slice(formInfo + 1)]
                            setData(newData)
                        } else {
                            setPageNumber(1)
                        }
                    } else {
                        let newData = [...data]
                        newData[formInfo] = res.data.data
                        setData(newData)
                    }
                } else {
                    removeEstimateFromTable(formInfo)
                }

                setShowForm(false)
            })
            .catch((error) => {
                console.log(error)
            })

    }

    function formCancelled(){
        setShowForm(false)
    }

    function editForm(e){
        const loc = e.target.parentElement.id
        setFormInfo(loc)
        setShowForm(true)
    }

    function deleteEntry(){
        api.delete("/estimate", { data : { id: data[formInfo]._id} })
            .then((res) => {
                removeEstimateFromTable(formInfo)
            })
            .catch((error) => {
                console.log(error)
            })

        setShowForm(false)
    }

    function removeEstimateFromTable(index){
        if(moreData){
            const query = getQuery(2, pageNumber * LIMIT - 1)
            api.get("/estimate" + query)
                .then((res) => {
                    const resData = res.data.data
                    if(resData.length === 1)
                        setMoreData(false)

                    let newData = [...data]
                    newData.splice(index, 1)
                    newData.push(resData[0])
                    setData(newData)
                })
                .catch((error) => {
                    console.log(error)
                })
        } else {
            if(data.length === 1){
                if(pageNumber === 1){
                    setData([])
                } else {
                    setPageNumber(prev => prev - 1)
                }
            } else {
                let newData = [...data]
                newData.splice(index, 1)
                setData(newData)
            }
        }
    }

    function getQuery(limit, offset){
        const typeFilter = document.getElementById("typeFilter").value
        const statusFilter = document.getElementById("statusFilter").value
        const sortBy = document.getElementById("sortBy").value

        let query = "?limit=" + limit + "&offset=" + offset
        if(typeFilter !== "All")
            query += "&type=" + typeFilter
        if(statusFilter !== "All")
            query += "&status=" + statusFilter
        if(sortBy === "Status Updated")
            query += "&sortBy=updatedAt"
        
        return query
    }

    function refreshTable(){
        let query = getQuery(LIMIT + 1, (LIMIT * (pageNumber - 1)))
        api.get("/estimate" + query)
            .then((res) => {
                const newData = res.data.data
                if(newData.length === (LIMIT + 1)){
                    setMoreData(true)
                    setData(newData.slice(0, LIMIT))
                } else {
                    setMoreData(false)
                    setData(newData)
                }
            })
            .catch((error) => {
                console.log(error)
            })
    }

    function tableSettingsChanged(){
        if(pageNumber === 1)
            refreshTable()    
        else
            setPageNumber(1)
        
    }

    return (
        <div>
            <div id="estimateContentContainer">
                <div id="estimateTableTopPanel">
                    <h2 id="estimateTableTitle">Estimates:</h2>
                    <div id="filterAndSortContainer">
                        <p className="filterAndSortText">Type:</p>
                        <select id="typeFilter" className="filterAndSortSelects" defaultValue="All" onChange={tableSettingsChanged}>
                            <option value="All">All</option>
                            <option value="Interior">Interior</option>
                            <option value="Restripe">Restripe</option>
                            <option value="Re-layout">Re-layout</option>
                            <option value="New Layout">New Layout</option>
                            <option value="Sports Court">Sports Court</option>
                            <option value="Other">Other</option>
                        </select>
                        <p className="filterAndSortText">Status:</p>
                        <select id="statusFilter" className="filterAndSortSelects" defaultValue="In Progress" onChange={tableSettingsChanged}>
                            <option value="In Progress">In Progress</option>
                            <option value="All">All</option>
                            <option value="Requested">Requested</option>
                            <option value="Provided">Provided</option>
                            <option value="Approved">Approved</option>
                            <option value="Waiting on Sub">Waiting on Sub</option>
                            <option value="Lost">Lost</option>
                            <option value="Other">Other</option>
                        </select>
                        <p className="filterAndSortText">Sort By:</p>
                        <select id="sortBy" className="filterAndSortSelects" defaultValue="All" onChange={tableSettingsChanged}>
                            <option value="Estimate Number">Estimate Number</option>
                            <option value="Status Updated">Status Updated</option>
                        </select>
                    </div>
                    <button id="createBtn" onClick={() => {setFormInfo(null); setShowForm(true)}}>Create Estimate</button>   
                </div>

                <div id="estimateTableContainer">
                    <table id="estimateTable">
                        <thead>
                            <tr>
                                <th>Date Created</th>
                                <th>Number</th>
                                <th>Client</th>
                                <th>Point of Contact</th>
                                <th>Phone Number</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Status Updated</th>
                                <th>Notes</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? <tr><td colSpan="10">No Estimates Yet</td></tr> : data.map((obj, i) => (
                                <>
                                    <tr id={i} key={2*i}>
                                        <td>{formatDate(obj.createdAt)}</td>
                                        <td>{obj.estimate_number}</td>
                                        <td>{obj.client}</td>
                                        <td>{obj.point_of_contact}</td>
                                        <td>{obj.phone_number}</td>
                                        <td><div className="colorCell" style={{backgroundColor: typeColorDict[obj.type]}}>{obj.type}</div></td>
                                        <td><div className="colorCell" style={{backgroundColor: typeColorDict[obj.status]}}>{obj.status}</div></td>
                                        <td>{formatDate(obj.updatedAt)}</td>
                                        <td className="noteToggle" onClick={(e) => {
                                            const id = e.target.parentElement.id
                                            const notesElement = document.getElementById("notesRow" + id)
                                            if(notesElement.className === "notesRowHidden"){
                                                document.getElementById("notesContainer" + id).style.animation = "expand 250ms linear 1 forwards"
                                                notesElement.className = "notesRowShown"
                                            } else {
                                                document.getElementById("notesContainer" + id).style.animation = "close 250ms linear 1 forwards"
                                                setTimeout(() => {notesElement.className = "notesRowHidden"}, 250)
                                            }
                                                
                                        }}>📋</td>
                                        <td className="editCell" onClick={editForm}>✏️</td>
                                    </tr>
                                    <tr id={`notesRow${i}`} className="notesRowHidden" key={2*i + 1}>
                                        <td className="notesRowContent" colSpan="10">
                                            <div id={`notesContainer${i}`} className="notesRowContainer">
                                                <div style={{padding: "10px"}}>
                                                    {obj.notes ? 
                                                    <>
                                                        <p className="notesRowTitle">Notes:</p>
                                                        <textarea className="notesRowText" value={obj.notes} readOnly></textarea>   
                                                    </>
                                                    : <p>No Notes Yet</p>}
                                                    
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            ))}
                            {(moreData || pageNumber !== 1) ?
                                <tr>
                                    <td colSpan="10">
                                        <div id="changePageContainer">
                                            {(pageNumber !== 1) ? <button className="rightLeftBtns" onClick={() => {setPageNumber(prev => prev - 1)}}>←</button> : null}
                                            <p id="pageNumberText">{pageNumber}</p>
                                            {moreData ? <button className="rightLeftBtns" onClick={() => {setPageNumber(prev => prev + 1)}}>→</button> : null}
                                        </div>
                                    </td>    
                                </tr>
                            : null}
                            
                        </tbody>
                    </table>
                    
                </div>
            </div>

            {showForm ? <EstimateForm data={formInfo ? data[formInfo] : null} permission={permission} created={estimateCreated} modified={estimateUpdated} cancelled={formCancelled} deleted={deleteEntry}/> : null}  
        </div>
        
    )
}

export default Estimates
