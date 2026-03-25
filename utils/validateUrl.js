const validateMonitorInput = (req, res, next) => {
    const { url, intervalSeconds } = req.body;

    // Validate URL
    if (url) {
        try {
            const parsedUrl = new URL(url);

            // 1. Only allow http:// or https://
            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                return res.status(400).json({ message: 'Validation Error: Only HTTP and HTTPS protocols are allowed' });
            }

            const hostname = parsedUrl.hostname;

            // 2. Block localhost
            if (hostname === 'localhost') {
                return res.status(400).json({ message: 'Validation Error: Localhost URLs are not allowed' });
            }

            // 3. Block private IPs (127.x.x.x, 10.x.x.x, 172.16.x.x to 172.31.x.x, 192.168.x.x)
            const isPrivateIp = /^(127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.)/.test(hostname);
            if (isPrivateIp) {
                return res.status(400).json({ message: 'Validation Error: Private IP addresses are not allowed' });
            }
        } catch (err) {
            return res.status(400).json({ message: 'Validation Error: Invalid URL format' });
        }
    } else {
        return res.status(400).json({ message: 'Validation Error: URL is required' });
    }

    // Validate Interval (Minimum 30 seconds)
    if (intervalSeconds !== undefined) {
        if (intervalSeconds < 30) {
            return res.status(400).json({ message: 'Validation Error: Interval must be at least 30 seconds' });
        }
    } else {
        // Optional: If you want to enforce that interval is always provided, uncomment the below.
        // return res.status(400).json({ message: 'Validation Error: intervalSeconds is required' });
    }

    next();
};

module.exports = validateMonitorInput;
