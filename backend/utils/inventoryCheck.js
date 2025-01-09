const Inventory = require('../models/Inventory');

const checkNearExpiryItems = async () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    try {
        await Inventory.updateMany(
            {
                expiryDate: { 
                    $gte: new Date(), 
                    $lte: threeDaysFromNow 
                },
                status: 'available'
            },
            {
                status: 'near-expiry',
                discountedPrice: { $multiply: ['$price', 0.7] } // 30% discount
            }
        );
    } catch (error) {
        console.error('Error checking near-expiry items:', error);
    }
};

module.exports = checkNearExpiryItems; 