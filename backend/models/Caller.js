const mongoose = require('mongoose');

const callerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Caller name is required'],
        trim: true,
    },
    role: {
        type: String,
        trim: true,
    },
    languages: {
        type: [String],
        default: [],
    },
    assignedStates: {
        type: [String],
        default: [],
    },
    dailyLimit: {
        type: Number,
        default: 0, // 0 = unlimited
    },
    todayAssignedCount: {
        type: Number,
        default: 0,
    },
    lastAssignedAt: {
        type: Date,
        default: null,
    },
    lastResetDate: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Caller', callerSchema);
