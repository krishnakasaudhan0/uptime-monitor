const mongoose = require('mongoose');

const checkSchema = new mongoose.Schema({
    monitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true,
        index: true
    },
    roundNumber: {
        type: Number,
        required: true,
        default: 1
    },
    scheduledAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    finalStatus: {
        type: String,
        enum: ['up', 'down', 'pending'],
        default: 'pending'
    },
    quorumReached: {
        type: Boolean,
        default: false
    },
    summary: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Check = mongoose.model('Check', checkSchema);

module.exports = Check;
