
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

/**
 * Native REST API to safely look up specific Monitor telemetry
 * Returning aggregated data without blocking the main dashboard execution layout!
 */
router.get('/:id/data', fetchUserData, async (req, res) => {
    try {
        const Monitor = require('../models/monitor');
        const Check = require('../models/checkModel');
        const CheckResult = require('../models/checkResult');
        const Incident = require('../models/incident');

        const monitor = await Monitor.findById(req.params.id);
        if (!monitor || String(monitor.userId) !== String(req.user.id || req.user._id)) {
            return res.status(403).json({ error: "Access natively denied." });
        }

        // Fetch recent resolved check rounds natively sorting sequentially
        const recentChecks = await Check.find({ monitorId: monitor._id, finalStatus: { $ne: 'pending' } })
            .sort({ scheduledAt: -1 })
            .limit(10)
            .lean();

        // Stitch Validator historical result payloads onto their respective parent Checks
        for (let check of recentChecks) {
            check.results = await CheckResult.find({ checkRoundId: check._id }).limit(5);
        }

        const incidents = await Incident.find({ monitorId: monitor._id })
            .sort({ startedAt: -1 })
            .limit(5);

        res.status(200).json({ monitor, recentChecks, incidents });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

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
