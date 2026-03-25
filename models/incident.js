const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    monitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true,
        index: true
    },
    startedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    endedAt: {
        type: Date,
        default: null
    },
    statusAtStart: {
        type: String,
        enum: ['down', 'pending', 'up'],
        required: true,
        default: 'down'
    },
    resolved: {
        type: Boolean,
        required: true,
        default: false,
        index: true // Useful for querying all currently ongoing/unresolved incidents
    },
    durationSeconds: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
