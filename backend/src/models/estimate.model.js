import mongoose from "mongoose";

const estimateSchema = new mongoose.Schema({
    estimate_number: {
        type: Number,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    point_of_contact: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    type: {
        type: String, //“Interior”, “Restripe”, “Re-layout”, “New Layout”, “Sports Court”, or “Other”
        required: true
    },
    status: {
        type: String, //“Requested”, “Provided”, “Approved”, “Waiting on Sub”, “Lost”, or “Other”,
        required: true
    },
    notes: {
        type: String,
        required: false
    }
}, {timestamps: true})

const Estimate = mongoose.model('Estimate', estimateSchema)

export default Estimate
