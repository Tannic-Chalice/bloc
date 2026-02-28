const express = require('express');
const router = express.Router();
const Caller = require('../models/Caller');

router.post('/', async (req, res, next) => {
    try {
        const caller = new Caller(req.body);
        await caller.save();

        res.status(201).json({
            success: true,
            data: caller,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        next(error);
    }
});
router.get('/', async (req, res, next) => {
    try {
        const callers = await Caller.find({});

        res.status(200).json({
            success: true,
            count: callers.length,
            data: callers,
        });
    } catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const caller = await Caller.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );

        if (!caller) {
            return res.status(404).json({
                success: false,
                message: 'Caller not found',
            });
        }

        res.status(200).json({
            success: true,
            data: caller,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/callers/:id
 * @desc    Delete a caller by ID
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const caller = await Caller.findByIdAndDelete(req.params.id);

        if (!caller) {
            return res.status(404).json({
                success: false,
                message: 'Caller not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Caller deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
