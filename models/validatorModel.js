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
        unique: true, // Ensuring each validator has a unique API key / identity
        index: true
    }
}, {
    timestamps: true
});

const Validator = mongoose.model('Validator', validatorSchema);

module.exports = Validator;
