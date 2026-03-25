const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        // Not required because users signing up with Google won't have a password initially
    },
    googleId: {
        type: String,
        sparse: true, // sparse allows multiple users to have a null googleId while keeping it unique
        unique: true,
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
        required: true
    },
    avatar: {
        type: String,
        // Profile picture URL from Google
    }
}, { 
    timestamps: true 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
