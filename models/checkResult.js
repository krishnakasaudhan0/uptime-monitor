const mongoose = require('mongoose');

const checkResultSchema = new mongoose.Schema({
    checkRoundId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Check',
        required: true,
        index: true // Indexed for quick lookups query by the parent Check cycle
    },
    monitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true,
        index: true
    },
    validatorId: {
        type: String,
        required: true,
        index: true
    },
    success: {
        type: Boolean,
        required: true,
        default: false
    },
    statusCode: {
        type: Number
    },
    responseTimeMs: {
        type: Number
    },
    errorMessage: {
        type: String,
        trim: true
    },
    checkedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    region: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const CheckResult = mongoose.model('CheckResult', checkResultSchema);

module.exports = CheckResult;
