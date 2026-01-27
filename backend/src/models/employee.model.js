import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    permission: {
        type: String, //"Admin", or "Editor"
        required: true
    },
})

const Employee = new mongoose.model("Employee", employeeSchema)

export default Employee
