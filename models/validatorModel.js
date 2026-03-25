const mongoose = require('mongoose');

const validatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    region: {
        type: String,
        required: true,
        trim: true
    },
    validatorKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    lastHeartbeat: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Validator = mongoose.model('Validator', validatorSchema);

module.exports = Validator;
