import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Box,
    CircularProgress
} from '@mui/material';
import { supabase } from '../config/supabase';

const Donations = () => {
    const [donations, setDonations] = useState([]);
    const [partners, setPartners] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
    const [newDonation, setNewDonation] = useState({
        donor_name: '',
        category: '',
        food_items: '',
        quantity: '',
        status: 'pending'
    });
    const [formErrors, setFormErrors] = useState({});

    const categories = ['fruits', 'vegetables', 'dairy', 'bakery', 'meat', 'other'];

    useEffect(() => {
        fetchDonations();
        fetchPartners();
    }, []);

    const fetchDonations = async () => {
        try {
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDonations(data || []);
        } catch (error) {
            console.error('Error fetching donations:', error);
            showAlert('Error fetching donations', 'error');
        }
    };

    const fetchPartners = async () => {
        try {
            const { data, error } = await supabase
                .from('partners')
                .select('*');

            if (error) throw error;
            setPartners(data || []);
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!newDonation.donor_name.trim()) {
            errors.donor_name = 'Donor name is required';
        }
        if (!newDonation.category) {
            errors.category = 'Category is required';
        }
        if (!newDonation.food_items.trim()) {
            errors.food_items = 'Food items are required';
        }
        if (!newDonation.quantity || newDonation.quantity <= 0) {
            errors.quantity = 'Valid quantity is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const showAlert = (message, severity = 'success') => {
        setAlert({
            show: true,
            message,
            severity
        });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false }));
        }, 6000);
    };

    const handleAddDonation = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields correctly', 'error');
            return;
        }

        setLoading(true);
        try {
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .insert([{
                    ...newDonation,
                    quantity: parseInt(newDonation.quantity),
                }])
                .select();

            if (donationError) throw donationError;

            const { error: inventoryError } = await supabase
                .from('inventory')
                .insert([{
                    product_name: newDonation.food_items,
                    category: newDonation.category,
                    quantity: parseInt(newDonation.quantity),
                    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    price: 0,
                    status: 'available',
                    donor: newDonation.donor_name
                }]);

            if (inventoryError) throw inventoryError;

            showAlert('Donation added successfully!');
            setDonations([...donations, donationData[0]]);
            setNewDonation({
                donor_name: '',
                category: '',
                food_items: '',
                quantity: '',
                status: 'pending'
            });
            setOpen(false);
        } catch (error) {
            console.error('Error adding donation:', error);
            showAlert('Error adding donation', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field) => (event) => {
        setNewDonation(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Clear error for the field being changed
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            {alert.show && (
                <Alert 
                    severity={alert.severity} 
                    sx={{ mb: 2 }}
                    onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                >
                    {alert.message}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Donations
                            </Typography>
                            <Typography variant="h3">
                                {donations.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Partner Organizations
                            </Typography>
                            <Typography variant="h3">
                                {partners.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Pending Donations
                            </Typography>
                            <Typography variant="h3">
                                {donations.filter(d => d.status === 'pending').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => setOpen(true)}
                >
                    New Donation
                </Button>
            </Box>

            <Grid container spacing={3}>
                {donations.map((donation) => (
                    <Grid item xs={12} md={4} key={donation.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{donation.donor_name}</Typography>
                                <Typography>Items: {donation.food_items}</Typography>
                                <Typography>Quantity: {donation.quantity}</Typography>
                                <Typography>Category: {donation.category}</Typography>
                                <Typography 
                                    color={donation.status === 'completed' ? 'success.main' : 'warning.main'}
                                >
                                    Status: {donation.status}
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Date: {new Date(donation.created_at).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog 
                open={open} 
                onClose={() => !loading && setOpen(false)} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle>New Donation</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Donor Name"
                        margin="normal"
                        value={newDonation.donor_name}
                        onChange={handleInputChange('donor_name')}
                        error={!!formErrors.donor_name}
                        helperText={formErrors.donor_name}
                        required
                        disabled={loading}
                    />
                    <TextField
                        select
                        fullWidth
                        label="Category"
                        margin="normal"
                        value={newDonation.category}
                        onChange={handleInputChange('category')}
                        error={!!formErrors.category}
                        helperText={formErrors.category}
                        required
                        disabled={loading}
                    >
                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="Food Items"
                        margin="normal"
                        value={newDonation.food_items}
                        onChange={handleInputChange('food_items')}
                        error={!!formErrors.food_items}
                        helperText={formErrors.food_items}
                        required
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        margin="normal"
                        value={newDonation.quantity}
                        onChange={handleInputChange('quantity')}
                        error={!!formErrors.quantity}
                        helperText={formErrors.quantity}
                        required
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setOpen(false)} 
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddDonation} 
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Add Donation'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Donations; 
