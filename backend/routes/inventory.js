const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await Inventory.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ 
            message: 'Error fetching inventory items',
            error: error.message 
        });
    }
});

// Add new inventory item
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['productName', 'category', 'quantity', 'expiryDate', 'price'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ 
                    message: `Missing required field: ${field}` 
                });
            }
        }

        const item = new Inventory({
            productName: req.body.productName,
            category: req.body.category,
            quantity: Number(req.body.quantity),
            expiryDate: new Date(req.body.expiryDate),
            price: Number(req.body.price),
            location: req.body.location || 'Default Location',
            status: 'available'
        });

        const newItem = await item.save();
        console.log('New item added:', newItem);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(400).json({ 
            message: 'Error adding inventory item',
            error: error.message 
        });
    }
});

// Get near-expiry items
router.get('/near-expiry', async (req, res) => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const items = await Inventory.find({
            expiryDate: { 
                $gte: new Date(), 
                $lte: threeDaysFromNow 
            },
            status: 'available'
        });
        res.json(items);
    } catch (error) {
        console.error('Error fetching near-expiry items:', error);
        res.status(500).json({ 
            message: 'Error fetching near-expiry items',
            error: error.message 
        });
    }
});

module.exports = router; 