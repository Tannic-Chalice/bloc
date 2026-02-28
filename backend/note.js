
require('dotenv').config();
const mongoose = require('mongoose');
const Caller = require('./models/Caller');
const callers = [
    {
        name: 'Rahul Sharma',
        role: 'Senior Agent',
        languages: ['English', 'Hindi'],
        assignedStates: ['Maharashtra', 'Gujarat'],
        dailyLimit: 50
    },
    {
        name: 'Priya Nair',
        role: 'Agent',
        languages: ['English', 'Malayalam', 'Tamil'],
        assignedStates: ['Kerala', 'Tamil Nadu'],
        dailyLimit: 50
    },
    {
        name: 'Amit Patel',
        role: 'Junior Agent',
        languages: ['English', 'Hindi', 'Gujarati'],
        assignedStates: ['Gujarat', 'Rajasthan'],
        dailyLimit: 50
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        if (process.argv.includes('--clear')) {
            const deleted = await Caller.deleteMany({});
            console.log(`Cleared ${deleted.deletedCount} existing callers.`);
        }

        const inserted = await Caller.insertMany(callers);
        console.log(`Inserted ${inserted.length} callers:\n`);

        inserted.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.name} (${c.role}) — States: [${c.assignedStates.join(', ')}] — Limit: ${c.dailyLimit || 'unlimited'}`);
        });

        console.log('\nDone!');
    } catch (error) {
        console.error('Error seeding callers:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
