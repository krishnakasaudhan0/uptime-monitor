const Monitor = require('../models/monitor');
const Check = require('../models/checkModel');

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
 * Main Scheduler Engine loop
 */
const scheduleChecks = async () => {
    try {
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
