const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { assignLead } = require('../services/assignmentService');
const { getIO } = require('../socket');
router.post('/', async (req, res, next) => {
    try {
        const assignedCaller = await assignLead(req.body);

        const lead = new Lead({
            ...req.body,
            assignedCallerId: assignedCaller._id,
            assignedAt: new Date(),
        });

        const savedLead = await lead.save();

        const populatedLead = await Lead.findById(savedLead._id).populate(
            'assignedCallerId',
            'name',
        );
        const io = getIO();
        io.emit('newLead', populatedLead);

        res.status(201).json({
            success: true,
            data: populatedLead,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
});

/**
 * @route   GET /api/leads/active
 * @desc    Get only active (non-completed) leads
 */
router.get('/active', async (req, res, next) => {
    try {
        const leads = await Lead.find({ status: { $ne: 'completed' } })
            .populate('assignedCallerId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/leads
 * @desc    Get all leads with assigned caller name populated
 */
router.get('/', async (req, res, next) => {
    try {
        const leads = await Lead.find({}).populate('assignedCallerId', 'name');

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PATCH /api/leads/:id/status
 * @desc    Update lead status. If status is 'completed', auto-delete the lead.
 */
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        // If call is completed, delete the lead from DB (soft → hard delete)
        if (status === 'completed') {
            await Lead.findByIdAndDelete(req.params.id);

            // Emit socket event so all clients know this lead is done
            const io = getIO();
            io.emit('leadCompleted', { leadId: req.params.id });

            return res.status(200).json({
                success: true,
                message: 'Call completed — lead removed',
                data: { _id: req.params.id, status: 'completed' },
            });
        }

        // Otherwise just update the status
        lead.status = status;
        await lead.save();

        const updatedLead = await Lead.findById(lead._id).populate(
            'assignedCallerId',
            'name',
        );

        // Emit status change event
        const io = getIO();
        io.emit('leadStatusUpdated', updatedLead);

        res.status(200).json({
            success: true,
            data: updatedLead,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/leads/:id
 * @desc    Manually delete a lead
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found',
            });
        }

        // Emit socket event
        const io = getIO();
        io.emit('leadDeleted', { leadId: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Lead deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
