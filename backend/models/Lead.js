const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lead name is required'],
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    timestamp: {
        type: Date,
    },
    leadSource: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'calling', 'completed', 'no-answer', 'failed'],
        default: 'pending',
    },
    assignedCallerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Caller',
        default: null,
    },
    assignedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Lead', leadSchema);
