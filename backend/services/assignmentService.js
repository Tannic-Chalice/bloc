const Caller = require('../models/Caller');

/**
 * Determine if two dates fall on the same calendar day.
 */
function isSameDay(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

/**
 * Assign a lead to the best-fit caller using round-robin + state matching.
 *
 * @param {Object} leadData — the incoming lead (must include .state if state-matching is desired)
 * @returns {Object} the selected Caller document (already saved)
 * @throws {Error} if no callers exist or none are eligible
 */
async function assignLead(leadData) {
    // 1. Fetch all callers
    const callers = await Caller.find({});

    if (callers.length === 0) {
        const err = new Error('No callers available in the system');
        err.statusCode = 400;
        throw err;
    }

    // 2. Filter by state match — fallback to all callers if no match
    let pool = callers;

    if (leadData.state) {
        const stateMatched = callers.filter((c) =>
            c.assignedStates.includes(leadData.state),
        );

        if (stateMatched.length > 0) {
            pool = stateMatched;
        }
    }

    const today = new Date();

    // 3. Reset daily counters for callers whose lastResetDate is not today
    for (const caller of pool) {
        if (!caller.lastResetDate || !isSameDay(caller.lastResetDate, today)) {
            caller.todayAssignedCount = 0;
            caller.lastResetDate = today;
            await caller.save();
        }
    }

    // 4. Remove callers who have hit their daily limit
    const eligible = pool.filter((c) => {
        if (c.dailyLimit > 0 && c.todayAssignedCount >= c.dailyLimit) {
            return false;
        }
        return true;
    });

    if (eligible.length === 0) {
        const err = new Error('All callers have reached their daily limit');
        err.statusCode = 400;
        throw err;
    }

    // 5. Sort by lastAssignedAt ascending, null values first (round-robin)
    eligible.sort((a, b) => {
        if (a.lastAssignedAt === null && b.lastAssignedAt === null) return 0;
        if (a.lastAssignedAt === null) return -1;
        if (b.lastAssignedAt === null) return 1;
        return new Date(a.lastAssignedAt) - new Date(b.lastAssignedAt);
    });

    // 6. Select the first (least recently assigned) caller
    const selected = eligible[0];

    // 7. Update assignment counters
    selected.todayAssignedCount += 1;
    selected.lastAssignedAt = new Date();
    await selected.save();

    return selected;
}

module.exports = { assignLead };
