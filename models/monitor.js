const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Indexing this field for faster queries when fetching a user's monitors
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
        default: 'GET',
        uppercase: true
    },
    expectedStatusCode: {
        type: Number,
        default: 200
    },
    timeoutMs: {
        type: Number,
        default: 30000 // 30 seconds default timeout
    },
    intervalSeconds: {
        type: Number,
        default: 60 // 1 minute default interval
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastStatus: {
        type: String,
        enum: ['up', 'down', 'pending'],
        default: 'pending'
    },
    lastCheckedAt: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true 
});

const Monitor = mongoose.model('Monitor', monitorSchema);

module.exports = Monitor;
