import express from "express"
import Employee from "../models/employee.model.js";

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find({}, { first_name: 1, last_name: 1, email: 1, permission: 1 })

        res.status(200).json({ success: true, data: employees })
    } catch (error) {
        console.log(`Error getting employees: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

router.get('/:id', async (req, res) => {
    const id = req.params.id
    
    try {
        const employee = await Employee.findOne({_id: id})

        res.status(200).json({ success: true, data: {
            _id: employee._id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            permission: employee.permission 
        }})
    } catch (error) {
        console.log(`Error getting employee: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

router.post('/', async (req, res) => {
    let employee = req.body

    try {
        const employeeWithEmail = await Employee.find({ email: employee.email })
        if(employeeWithEmail.length != 0){
           res.status(200).json({ success: false, message: "Email already exist"})
           return
        }
    } catch (error) {
        console.log(`Error creating employee: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
    
    employee.permission = 'Editor'

    const newEmployee = new Employee(employee)

    try {
        await newEmployee.save()
        res.status(200).json({ success: true, data: {
            _id: newEmployee._id,
            first_name: newEmployee.first_name,
            last_name: newEmployee.last_name,
            email: newEmployee.email,
            permission: newEmployee.permission
        }})
    } catch (error) {
        console.log(`Error creating employee: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

router.post('/signin', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    try {
        const employee = await Employee.find({ email: email, password: password })
        const verified = employee.length > 0

        if(verified){
            res.status(200).json({ success: true, verified: true, data: {
                _id: employee[0]._id,
                first_name: employee[0].first_name,
                last_name: employee[0].last_name,
                email: employee[0].email,
                permission: employee[0].permission
            }})
        } else {
            res.status(200).json({ success: true, verified: false})
        }
        
    } catch (error) {
        console.log(`Error verifying employee: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

router.put('/', async (req, res) => {
    const id = req.body.id
    const update = req.body.update

    try {
        const updatedEmployee = await Employee.findOneAndUpdate({ _id: id }, update, { new: true })
        res.status(200).json({ success: true, data: {
            _id: updatedEmployee._id,
            first_name: updatedEmployee.first_name,
            last_name: updatedEmployee.last_name,
            email: updatedEmployee.email,
            permission: updatedEmployee.permission
        }})
    } catch (error) {
        console.log(`Error updating employee: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
    
})

router.delete('/', async (req, res) => {
    const id = req.body.id

    try {
        await Employee.findOneAndDelete({ _id:id })

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(`Error deleting employee: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

export default router