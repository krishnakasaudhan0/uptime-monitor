
const express = require('express');
const fetchUserData=require('../utils/fetchUserData')
const Monitor=require('../models/monitor')
const validateMonitorInput = require('../utils/validateUrl')
const scheduler=require('../utils/scheduler')

const router=express.Router();
router.post('/',fetchUserData,validateMonitorInput,async (req,res)=>{
    const {name,url,method,expectedStatusCode,timeoutMs,intervalSeconds}=req.body;
    const monitor=new Monitor({
        userId:req.user.id || req.user._id,
        name,
        url,    
        method,
        expectedStatusCode,
        timeoutMs,
        intervalSeconds
    })
    await monitor.save();
    res.status(201).json(monitor);
})

router.get('/',fetchUserData,async (req,res)=>{
    const monitors=await Monitor.find({userId:req.user.id || req.user._id});
    res.status(200).json(monitors);
})

router.put('/:id',fetchUserData,validateMonitorInput,async (req,res)=>{
    const {name,url,method,expectedStatusCode,timeoutMs,intervalSeconds}=req.body;
    const monitor=await Monitor.findByIdAndUpdate(req.params.id,{name,url,method,expectedStatusCode,timeoutMs,intervalSeconds},{new:true});
    res.status(200).json(monitor);
})

router.delete('/:id',fetchUserData,async (req,res)=>{
    const monitor=await Monitor.findByIdAndDelete(req.params.id);
    res.status(200).json(monitor);
})
router.patch('/:id',fetchUserData,async (req,res)=>{
    const {isActive}=req.body;
    const monitor=await Monitor.findByIdAndUpdate(req.params.id,{isActive},{new:true});
    res.status(200).json(monitor);
})
module.exports = router;
