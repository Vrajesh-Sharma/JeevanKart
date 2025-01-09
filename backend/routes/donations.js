const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get items available for donation
router.get('/available', async (req, res) => {
    try {
        const items = await Inventory.find({
            status: 'near-expiry'
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark item as donated
router.post('/donate/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(
            req.params.id,
            { status: 'donated' },
            { new: true }
        );
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 