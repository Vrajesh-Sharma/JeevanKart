const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get inventory statistics
router.get('/stats', async (req, res) => {
    try {
        const totalItems = await Inventory.countDocuments();
        const nearExpiry = await Inventory.countDocuments({
            status: 'near-expiry'
        });
        const donated = await Inventory.countDocuments({
            status: 'donated'
        });

        res.json({
            totalItems,
            nearExpiry,
            donated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get category-wise distribution
router.get('/category-distribution', async (req, res) => {
    try {
        const distribution = await Inventory.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 