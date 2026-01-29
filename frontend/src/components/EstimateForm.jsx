import React from 'react'
import { useState } from 'react'
import './Form.css'

const EstimateForm = ({ data, permission, created, modified, cancelled, deleted }) => {
    const [errors, setErrors] = useState([])
    
    function tryToSubmit(e){
        e.preventDefault()
        let form = document.getElementById("estimateForm")
        let formData = new FormData(form)

        //Check Form Data
        let errors = []
        if(!(/^\d+$/.test(formData.get("estimate_number")))){
            if(!formData.get("estimate_number"))
                errors.push("Enter an Estimate Number")
            else
                errors.push("Estimate Numbers Must Contain Only Digits")
        }
        if(!formData.get("client")){
            errors.push("Enter a Client")
        }
        if(!formData.get("point_of_contact")){
            errors.push("Enter a Point of Contact")
        }
        if(!(/^\d{10}$/.test(formData.get("phone_number")))){
            errors.push("Enter a 10 digit phone number")
        }
        if(formData.get("type") === "Blank"){
            errors.push("Select a type")
        }
        if(formData.get("status") === "Blank"){
            errors.push("Select a Status")
        }
        
        if(errors.length > 0){
            setErrors(errors)
            document.getElementById("formArea").scrollTop = 0
            return
        }

        if(data){
            let newData = {}
            let changeMade = false

            for(const [key, value] of formData.entries()){
                if(data[key] != value){
                    newData[key] = value
                    changeMade = true
                }
            }

            if(changeMade)
                modified(newData)
            else
                cancelled()

        } else {
            let newData = {}

            for(const [key, value] of formData.entries()){
                if(value)
                    newData[key] = value
            }
            
            created(newData)
        }
       
    }

    function closeForm(e){
        e.preventDefault()
        cancelled()
    }

    function deleteEntry(e){
        e.preventDefault()
        deleted()
    }

    function formateDateForForm(date_data){
        const date = new Date(date_data)

        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')

        return `${year}-${month}-${day}`;
    }
        
    return (

        <div id="form">
            <div id="formArea">
                {data ? null :
                    <>
                        <h1 id="formTitle">New Estimate</h1>
                        {(errors.length > 0) ? 
                            <>
                                <br></br>
                                {errors.map((error, i) => <p key={i} id="errorMsg">{error}</p>)}
                            </>
                         : null}
                        <br></br>
                    </>
                }

                <form id="estimateForm">
                    <label htmlFor="estimate_number">Estimate Number:</label><br></br>
                    <input id="estimate_number" name="estimate_number" type="text" defaultValue={data ? data.estimate_number : null}></input><br></br><br></br>
                    <label htmlFor="client">Client:</label><br></br>
                    <input id="client" name="client" type="text" defaultValue={data ? data.client : null}></input><br></br><br></br>
                    <label htmlFor="point_of_contact">Point of Contact:</label><br></br>
                    <input id="point_of_contact" name="point_of_contact" type="text" defaultValue={data ? data.point_of_contact : null}></input><br></br><br></br>
                    <label htmlFor="phone_number">Phone Number:</label><br></br>
                    <input id="phone_number" name="phone_number" type="text" defaultValue={data ? data.phone_number : null}></input><br></br><br></br>
                    <label htmlFor="type">Type:</label>
                    <select id="type" name="type" defaultValue={data ? data.type : "Blank"}>
                        {data ? null : <option value="Blank"></option>}
                        <option value="Interior">Interior</option>
                        <option value="Restripe">Restripe</option>
                        <option value="Re-layout">Re-layout</option>
                        <option value="New Layout">New Layout</option>
                        <option value="Sports Court">Sports Court</option>
                        <option value="Other">Other</option>
                    </select><br></br><br></br>
                    <label htmlFor="status">Status:</label>
                    <select id="status" name="status" defaultValue={data ? data.status : "Blank"}>
                        {data ? null : <option value="Blank"></option>}
                        <option value="Requested">Requested</option>
                        <option value="Provided">Provided</option>
                        <option value="Approved">Approved</option>
                        <option value="Waiting on Sub">Waiting on Sub</option>
                        <option value="Lost">Lost</option>
                        <option value="Other">Other</option>
                    </select><br></br><br></br>
                    <label htmlFor="due_date">Due Date:</label>
                    <input id="due_date" name="due_date" type="date" defaultValue={(data && data.due_date) ? formateDateForForm(data.due_date) : null}></input><br></br><br></br>
                    <label htmlFor="notes">Notes:</label><br></br>
                    <textarea id="notes" name="notes" defaultValue={(data && data.notes) ? data.notes : null}></textarea><br></br><br></br>
                    <button id="formCreateBtn" onClick={tryToSubmit}>{data ? "Save & Close" : "Create"}</button>
                    <button id="cancelBtn" onClick={closeForm}>Cancel</button>
                    {(data && permission === "Admin") ? <button id="deleteBtn" onClick={deleteEntry}>Delete</button> : null}
                </form>
            </div>
        </div>
    )
}

export default EstimateForm
