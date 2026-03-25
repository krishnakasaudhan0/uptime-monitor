const SERVER_URL = 'http://localhost:3000/api/validators';

async function runValidator() {
    console.log("🚀 Booting up Test Validator Node...");

    // 1. Paste the key you securely copied from the dashboard right here!
    let API_KEY = "PASTE_YOUR_DASHBOARD_KEY_HERE";

    if (API_KEY === "PASTE_YOUR_DASHBOARD_KEY_HERE") {
        console.log("No key provided manually! Automatically registering a fresh one...");
        const regRes = await fetch(`${SERVER_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: "My Local Macbook Node", region: "local-dev" })
        });
        
        const regData = await regRes.json();
        if (!regRes.ok) return console.error("Failed to register:", regData);
        
        API_KEY = regData.validatorKey;
        console.log(`✅ Automatically registered! My temporary API Key is: ${API_KEY}\n`);
    } else {
        console.log(`✅ Hooking into existing Dashboard Validator instance natively...\n`);
    }

    // 2. Loop continuously to Heartbeat and Fetch Jobs
    setInterval(async () => {
        try {
            // A. Send Heartbeat to let the dashboard know we are online!
            await fetch(`${SERVER_URL}/heartbeat`, {
                method: 'POST',
                headers: { 'x-validator-key': API_KEY }
            });

            // B. Fetch Pending Check Jobs
            const jobsRes = await fetch(`${SERVER_URL}/jobs`, {
                headers: { 'x-validator-key': API_KEY }
            });
            
            if (jobsRes.ok) {
                const { jobs } = await jobsRes.json();
                
                if (jobs && jobs.length > 0) {
                    console.log(`\n📥 Received ${jobs.length} pending checks!`);
                    
                    // C. Process each job natively
                    for (const job of jobs) {
                        const monitor = job.monitorId;
                        if (!monitor) continue; // If monitor was deleted safely ignore
                        
                        console.log(`🔍 Pinging target URL: ${monitor.url}`);
                        
                        const startTime = Date.now();
                        let success = false;
                        let statusCode = null;
                        let errorMessage = "";
                        
                        try {
                            // Actual HTTP request to the target website!
                            // (Aborts automatically native to Node >= 18 using AbortSignal inside if strictly required, but keeping it simple)
                            const pingRes = await fetch(monitor.url, { 
                                method: monitor.method || 'GET'
                            });
                            
                            statusCode = pingRes.status;
                            success = (statusCode === monitor.expectedStatusCode); // Usually expecting 200
                        } catch (err) {
                            errorMessage = err.message;
                            success = false;
                        }
                        
                        const responseTimeMs = Date.now() - startTime;
                        
                        // D. Submit Results Back to the Server Backend
                        const submitRes = await fetch(`${SERVER_URL}/results`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'x-validator-key': API_KEY 
                            },
                            body: JSON.stringify({
                                checkRoundId: job._id,
                                monitorId: monitor._id,
                                success,
                                statusCode,
                                responseTimeMs,
                                errorMessage
                            })
                        });
                        
                        if (submitRes.ok) {
                            console.log(`📤 Submitted result for ${monitor.url}  =>  [Status: ${success ? 'UP ✅' : 'DOWN ❌'}] (${responseTimeMs}ms)`);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Validator Loop Error:", err.message);
        }
    }, 5000); // Poll and Heartbeat every 5 seconds
}

runValidator();
