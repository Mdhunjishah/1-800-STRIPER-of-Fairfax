import React from 'react'
import api from "../lib/axios"
import './Estimates.css'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import EstimateForm from './EstimateForm'

const LIMIT = 50

const Estimates = ({ permission }) => {
    const [data, setData] = useState([])
    const [formInfo, setFormInfo] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [moreData, setMoreData] = useState(true)

    useEffect(() => {
        refreshTable()
    }, [])

    useEffect(() => {
        refreshTable()
    }, [pageNumber])

    function formatDate(dateString, useUTC){
        let date = new Date(dateString)
        const month = useUTC ? date.getUTCMonth() : date.getMonth()
        const day = useUTC ? date.getUTCDate() : date.getDate()
        const year = useUTC ? date.getUTCFullYear() : date.getFullYear()
        return `${month + 1}/${day}/${year - Math.floor(year / 100) * 100}`
    }

    function formatPhoneNumber(number){
        const numberAsString = number.toString()
        return `${numberAsString.slice(0, 3)}-${numberAsString.slice(3, 6)}-${numberAsString.slice(6)}`
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
        const loadingToast = toast.loading("loading")
        api.post("/estimate", estimateData)
            .then((res) => {
                closeNotes()

                const typeFilter = document.getElementById("typeFilter").value
                const statusFilter = document.getElementById("statusFilter").value
                const sort = document.getElementById("sortBy").value
                if(typeInFilter(estimateData.type, typeFilter) && statusInFilter(estimateData.status, statusFilter)){
                    if(sort === "Due Date"){
                        refreshTable()
                    } else {
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
                    }
                } else {
                    if(sort !== "Due Date"){
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
                }

                toast.remove(loadingToast)
                toast.success("Estimate Created")
            })
            .catch((error) => {
                toast.remove(loadingToast)
                toast.error("Sorry, the Estimate couldn\'t be created")
                console.log(error)
            })
        setFormInfo(null)
    }

    function estimateUpdated(updateData){
        const loadingToast = toast.loading("loading")
        api.put("/estimate", { id: data[formInfo]._id,update: updateData })
            .then((res) => {
                closeNotes()

                const typeFilter = document.getElementById("typeFilter").value
                const statusFilter = document.getElementById("statusFilter").value
                const estimateType = updateData.type || data[formInfo].type
                const estimateStatus = updateData.status || data[formInfo].status
                
                if(typeInFilter(estimateType, typeFilter) && statusInFilter(estimateStatus, statusFilter)){
                    const sort = document.getElementById("sortBy").value
                    if(sort === "Due Date" && updateData.due_date){
                        refreshTable()
                    } else {
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
                    }
                } else {
                    removeEstimateFromTable(formInfo)
                }

                toast.remove(loadingToast)
                toast.success("Estimate Saved")
            })
            .catch((error) => {
                toast.remove(loadingToast)
                toast.error("Sorry, the Estimate couldn\'t be updated")
                console.log(error)
            })
            setFormInfo(null)
    }

    function formCancelled(showSavedMessage){
        if(showSavedMessage)
            toast.success("Estimate Saved")
        setFormInfo(null)
    }

    function editForm(e){
        const loc = Number(e.target.parentElement.id) / 2
        setFormInfo(loc)
    }

    function deleteEntry(){
        const loadingToast = toast.loading("loading")
        api.delete("/estimate", { data : { id: data[formInfo]._id} })
            .then((res) => {
                closeNotes()
                removeEstimateFromTable(formInfo)

                toast.remove(loadingToast)
                toast.success("Estimate Deleted")
            })
            .catch((error) => {
                toast.remove(loadingToast)
                toast.error("Sorry, the Estimate couldn\'t be deleted")
                console.log(error)
            })

        setFormInfo(null)
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
        else if(sortBy === "Due Date")
            query += "&sortBy=due_date"
        
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

    function getLines(notes){
        let lines = notes.split('\n')
        while(lines.length > 0 && lines[lines.length - 1] === "")
            lines.pop()
        return lines.map((line, i) => <p className="noteLines" key={i}>{line}</p>)
    }

    function closeNotes(){
        document.querySelectorAll(".notesRowContainer").forEach(container => {
            container.style.transition = "none"
            container.style.height = "0px"
        })
        
        document.querySelectorAll(".notesRowShown").forEach(row => row.className = "notesRowHidden")
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
                            <option value="Due Date">Due Date</option>
                        </select>
                    </div>
                    <button id="createBtn" onClick={() => {setFormInfo(-1)}}>Create Estimate</button>   
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
                                <th>Due Date</th>
                                <th>Notes</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? <tr><td colSpan="11">No Estimates Yet</td></tr> : data.map((obj, i) => (
                                <>
                                    <tr id={2*i} key={2*i} className="estimateTr">
                                        <td>{formatDate(obj.createdAt, false)}</td>
                                        <td>{"#" + obj.estimate_number}</td>
                                        <td>{obj.client}</td>
                                        <td>{obj.point_of_contact}</td>
                                        <td>{formatPhoneNumber(obj.phone_number)}</td>
                                        <td><div className="colorCell" style={{backgroundColor: typeColorDict[obj.type]}}>{obj.type}</div></td>
                                        <td><div className="colorCell" style={{backgroundColor: typeColorDict[obj.status]}}>{obj.status}</div></td>
                                        <td>{formatDate(obj.updatedAt, false)}</td>
                                        <td>{obj.due_date ? formatDate(obj.due_date, true) : "-"}</td>
                                        <td className="noteToggle" onClick={(e) => {
                                            const id = Number(e.target.parentElement.id) + 1
                                            const notesElement = document.getElementById("notesRow" + id)
                                            if(notesElement.className === "notesRowHidden"){
                                                notesElement.className = "notesRowShown"
                                                document.getElementById("notesContainer" + id).style.transition = "all 250ms linear 0s"
                                                document.getElementById("notesContainer" + id).style.height = `${document.getElementById("notesContentContainer" + id).offsetHeight}px`
                                            } else {
                                                document.getElementById("notesContainer" + id).style.height = "0px"
                                                setTimeout(() => {notesElement.className = "notesRowHidden"}, 250)
                                            }
                                                
                                        }}>📋</td>
                                        <td className="editCell" onClick={editForm}>✏️</td>
                                    </tr>
                                    <tr id={`notesRow${2*i + 1}`} className="notesRowHidden" key={2*i + 1}>
                                        <td className="notesRowContent" colSpan="11">
                                            <div id={`notesContainer${2*i + 1}`} className="notesRowContainer">
                                                <div id={`notesContentContainer${2*i + 1}`} className="notesContent">
                                                    {obj.notes && !(/^\s*$/.test(obj.notes)) ? 
                                                    <>
                                                        <p className="notesRowTitle">Notes:</p>
                                                        {getLines(obj.notes)}
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
                                    <td colSpan="11">
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

            {(formInfo !== null) ? <EstimateForm data={(formInfo !== -1) ? data[formInfo] : null} permission={permission} created={estimateCreated} modified={estimateUpdated} cancelled={formCancelled} deleted={deleteEntry}/> : null}  
            <Toaster/>
        </div>
        
    )
}

export default Estimates
