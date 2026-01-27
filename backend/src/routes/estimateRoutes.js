import express from "express";
import Estimate from "../models/estimate.model.js";

const router = express.Router()

router.get('/', async (req, res) => {
    //Type here can be any type an estimate can have as well as "In Progress"
    let { type, status, sortBy, limit, offset } = req.query

    let filter = {}
    if(type){
        filter["type"] = type
    }
    if(status){
        if(status === "In Progress")
            filter["status"] = {"$nin": ["Provided", "Lost"]}
        else
            filter["status"] = status 
    }

    sortBy = sortBy || "estimate_number"
    let sortingCriteria = {}
    sortingCriteria[sortBy] = -1

    try {
        const estimates = await Estimate.find(filter).sort(sortingCriteria).skip(offset).limit(limit)

        res.status(200).json({ success: true, data: estimates })
    } catch (error) {
        console.log(`Error getting estimates: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

router.post('/', async (req, res) => {
    let estimate = req.body

    const doc = await Estimate.find().sort({ estimate_number: -1 }).limit(1)

    if(doc.length === 0)
        estimate.estimate_number = 1
    else
        estimate.estimate_number = doc[0].estimate_number + 1

    const newEstimate = new Estimate(estimate)

    try {
        await newEstimate.save()
        res.status(200).json({ success: true, data: newEstimate })
    } catch (error) {
        console.log(`Error creating estimate: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

router.put('/', async (req, res) => {
    const id = req.body.id
    const update = req.body.update

    let statusChange = false
    if(req.body.update.status)
        statusChange = true

    try {
        const updatedEstimate = await Estimate.findOneAndUpdate({ _id: id }, update, { new: true, timestamps: statusChange })
        res.status(200).json({ success: true, data: updatedEstimate })
    } catch (error) {
        console.log(`Error updating estimate: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
    
})

router.delete('/', async (req, res) => {
    const id = req.body.id

    try {
        await Estimate.findOneAndDelete({ _id:id })

        res.status(200).json({ success: true })
    } catch (error) {
        console.log(`Error deleting estimate: ${error}`)
        res.status(500).json({ success: false, message: "Server Error"})
    }
})

export default router