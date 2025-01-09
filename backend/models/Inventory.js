const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['fruits', 'vegetables', 'dairy', 'bakery', 'meat', 'other']
    },
    quantity: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountedPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ['available', 'near-expiry', 'expired', 'donated'],
        default: 'available'
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema); 