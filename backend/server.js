require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const checkNearExpiryItems = require('./utils/inventoryCheck');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Connection error handling
mongoose.connection.on('error', err => {
    console.error('MongoDB Error:', err);
});

// Routes
const inventoryRoutes = require('./routes/inventory');
const donationRoutes = require('./routes/donations');
const analyticsRoutes = require('./routes/analytics');

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running' });
});

app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Scheduled tasks for inventory checking
cron.schedule('0 * * * *', async () => {
    try {
        await checkNearExpiryItems();
        console.log('Inventory check completed successfully');
    } catch (error) {
        console.error('Error in scheduled inventory check:', error);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 