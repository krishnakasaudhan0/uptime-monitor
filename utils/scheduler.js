const Monitor = require('../models/monitor');
const Check = require('../models/checkModel');
const CheckResult = require('../models/checkResult');
const Incident = require('../models/incident');

/**
 * Helper to simulate sending the job to global validators
 */
const pushJobsForValidators = async (checkRound, monitor) => {
    // In a real distributed system, you would push this payload to Redis (BullMQ), 
    // AWS SQS, or RabbitMQ. Since no queue tool is listed in package.json yet, 
    // we'll simulate the enqueueing logging.
    console.log(`[Job Queue] 🚀 Pushing validation job to validators for Monitor: ${monitor.name} | Check ID: ${checkRound._id}`);
    
    // Payload you would typically send to your queue:
    const jobPayload = {
        checkId: checkRound._id,
        monitorId: monitor._id,
        url: monitor.url,
        method: monitor.method,
        expectedStatusCode: monitor.expectedStatusCode,
        timeoutMs: monitor.timeoutMs
    };

    // ... Queue.add('validate-url', jobPayload)
};

/**
 * Evaluates pending checks that have surpassed 15 seconds.
 * Calculates status via majority consensus and triggers incident creation hooks natively.
 */
const evaluatePendingChecks = async () => {
    try {
        // Find checks older than 15 seconds to allow validators time to submit payload
        const threshold = new Date(Date.now() - 15000); 
        const pendingChecks = await Check.find({ 
            finalStatus: 'pending',
            scheduledAt: { $lt: threshold }
        }).populate('monitorId');

        for (const check of pendingChecks) {
            const results = await CheckResult.find({ checkRoundId: check._id });
            
            let finalStatus = 'unknown';
            if (results.length > 0) {
                const successes = results.filter(r => r.success).length;
                const failures = results.length - successes;
                
                // Majority Consensus Block
                if (successes > failures) finalStatus = 'up';
                else if (failures > successes) finalStatus = 'down';
                else finalStatus = 'unknown'; // Split tie scenario
            }

            check.finalStatus = finalStatus;
            await check.save();

            const monitor = check.monitorId;
            if (!monitor) continue; 

            const previousStatus = monitor.lastStatus || 'pending';
            
            // Native Incident Management
            if (previousStatus === 'up' && finalStatus === 'down') {
                await Incident.create({
                    monitorId: monitor._id,
                    startedAt: new Date(),
                    statusAtStart: 'up',
                    resolved: false
                });
            } else if (previousStatus === 'down' && finalStatus === 'up') {
                const openIncident = await Incident.findOne({ monitorId: monitor._id, resolved: false });
                if (openIncident) {
                    openIncident.resolved = true;
                    openIncident.endedAt = new Date();
                    openIncident.durationSeconds = Math.round((openIncident.endedAt.getTime() - openIncident.startedAt.getTime()) / 1000);
                    await openIncident.save();
                }
            }
            
            if(finalStatus !== 'unknown' && finalStatus !== previousStatus){
                monitor.lastStatus = finalStatus;
                await monitor.save();
            }
        }
    } catch(err) { 
        console.error("[Consensus Error]", err); 
    }
};

/**
 * Main Scheduler Engine loop
 */
const scheduleChecks = async () => {
    try {
        // FIRST: Safely evaluate older checks for consensus completion & incident lifecycle
        await evaluatePendingChecks();

        // 1. Fetch all ACTIVE monitors
        const activeMonitors = await Monitor.find({ isActive: true });
        const now = new Date();
        for (const monitor of activeMonitors) {
            
            // 2. Check if monitor is due
            let isDue = false;
            
            // If it has never been checked, it's due instantly
            if (!monitor.lastCheckedAt) {
                isDue = true;
            } else {
                // Calculate time elapsed
                const msSinceLastCheck = now.getTime() - monitor.lastCheckedAt.getTime();
                const intervalMs = (monitor.intervalSeconds || 60) * 1000;
                
                if (msSinceLastCheck >= intervalMs) {
                    isDue = true;
                }
            }

            if (isDue) {
                // Find next round number (optional, but good for tracking cycles sequentially)
                const previousChecks = await Check.countDocuments({ monitorId: monitor._id });
                const roundNum = previousChecks + 1;

                // 3. Create a new CheckRound
                // 4. Mark it pending
                const newCheckRound = new Check({
                    monitorId: monitor._id,
                    roundNumber: roundNum,
                    scheduledAt: now,
                    finalStatus: 'pending', 
                    quorumReached: false
                });
                
                await newCheckRound.save();

                // Update the monitor's lastCheckedAt so we don't spam checks
                monitor.lastCheckedAt = now;
                await monitor.save();

                // 5. Push jobs for validators
                await pushJobsForValidators(newCheckRound, monitor);
            }
        }
    } catch (err) {
        console.error("[Scheduler Error] Failed to run check scheduling cycle:", err);
    }
};

/**
 * Bootstraps the scheduler to tick continually
 */
const startScheduler = () => {
    console.log("[Scheduler] Booting up monitor schedule loop...");
    
    // Tick the scheduler every 5 seconds to constantly check for due items
    // (A shorter interval guarantees high precision)
    setInterval(scheduleChecks, 5000); 
};

module.exports = {
    scheduleChecks,
    startScheduler
};
