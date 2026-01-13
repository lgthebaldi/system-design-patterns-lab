// backend/controllers/syncController.js
const { syncQueue } = require('../queues/syncQueue');

const startSync = async (req, res) => {
    try {
        const { fileName } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: 'File name is required' });
        }

        console.log(`📢 Sync request received for: ${fileName}`);

        // Add job to the queue
        // 'full-import' is the job name
        // { fileName } is the payload the worker will receive
        await syncQueue.add('full-import', { 
            fileName,
            initiatedBy: req.user?.username || 'admin' 
        });

        // Respond IMMEDIATELY (Fire-and-Forget Pattern)
        return res.status(202).json({ 
            message: 'Sync process started in background.',
            file: fileName
        });

    } catch (error) {
        console.error('Error adding to queue:', error);
        return res.status(500).json({ error: 'Internal server error starting sync' });
    }
};

module.exports = { startSync };
