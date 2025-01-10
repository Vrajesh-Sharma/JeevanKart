import React, { useState, useEffect } from 'react';
// Import React and hooks for state and lifecycle management.
import { useAuth } from '../context/AuthContext';

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
    CircularProgress,
    Fade,
    Chip
} from '@mui/material';
// Import Material-UI components for building the UI.
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

import { supabase } from '../config/supabase';
// Import the Supabase client configuration.

const Donations = () => {
    // State variables for managing data, UI state, and form inputs.
    const [donations, setDonations] = useState([]); // Stores donation data.
    const [partners, setPartners] = useState([]); // Stores partner data.
    const [open, setOpen] = useState(false); // Tracks if the dialog is open.
    const [loading, setLoading] = useState(false); // Tracks loading state.
    const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' }); // For showing alerts.
    const [newDonation, setNewDonation] = useState({
        donor_name: '',
        category: '',
        food_items: '',
        quantity: '',
        status: 'pending'
    }); // Tracks new donation form inputs.
    const [newItem, setNewItem] = useState({
        product_name: '',
        category: '',
        quantity: 0,
        expiry_date: '',
        price: 0,
        location: '',
        donor_name: ''
      });
      const { user } = useAuth();
      const [inventory, setInventory] = useState([]);
    const [formErrors, setFormErrors] = useState({}); // Tracks form validation errors.

    const categories = ['fruits', 'vegetables', 'dairy', 'bakery', 'meat', 'other'];
    // Predefined categories for donation items.

    useEffect(() => {
        fetchDonations(); // Fetch donations when the component loads.
        fetchPartners(); // Fetch partners when the component loads.
    }, []); // Empty dependency array ensures this runs only once.

    useEffect(() => {
        fetchInventory();
        fetchDonations();
      }, []);
    
      const fetchInventory = async () => {
        try {
          const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('created_at', { ascending: false });
    
          if (error) throw error;
          setInventory(data);
        } catch (error) {
          console.error('Error fetching inventory:', error);
          setAlert({
            show: true,
            message: 'Error fetching inventory items',
            severity: 'error'
          });
        }
      };
    
      const handleAddItem = async () => {
        try {
          const requiredFields = ['donor_name', 'product_name', 'category', 'quantity', 'expiry_date', 'price'];
          const missingFields = requiredFields.filter(field => !newItem[field]);
          
          if (missingFields.length > 0) {
            setAlert({
              show: true,
              message: `Please fill in all required fields: ${missingFields.join(', ')}`,
              severity: 'error'
            });
            return;
          }
    
            // First create the donation record
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .insert([{
                    donor_name: newItem.donor_name,
                    category: newItem.category,
                    food_items: newItem.product_name,
                    quantity: Number(newItem.quantity),
                    price: Number(newItem.price),
                    expiry_date: new Date(newItem.expiry_date).toISOString(),
                    status: 'pending'
                }])
                .select();

            if (donationError) throw donationError;

            // Then create the inventory item with reference to the donation
          const formattedItem = {
                product_name: newItem.product_name,
                category: newItem.category,
            quantity: Number(newItem.quantity),
            price: Number(newItem.price),
            expiry_date: new Date(newItem.expiry_date).toISOString(),
                status: 'available',
                location: newItem.location,
                donor_id: donationData[0].id,
                donor: newItem.donor_name
          };
    
            const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .insert([formattedItem])
            .select();
    
            if (inventoryError) throw inventoryError;
    
          setAlert({
            show: true,
            message: 'Item added successfully!',
            severity: 'success'
          });
          setOpen(false);
          setNewItem({
            product_name: '',
            category: '',
            quantity: 0,
            expiry_date: '',
            price: 0,
            location: '',
            donor_name: ''
          });

            // Refresh both inventory and donations
          fetchInventory();
            fetchDonations();

        } catch (error) {
          console.error('Error adding item:', error);
          setAlert({
            show: true,
            message: error.message || 'Error adding item',
            severity: 'error'
          });
        }
      };

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
            setAlert({
                show: true,
                message: 'Error fetching donations',
                severity: 'error'
            });
        }
    };

    const fetchPartners = async () => {
        try {
            // Fetch partner organizations from the database.
            const { data, error } = await supabase.from('partners').select('*');

            if (error) throw error; // Handle any errors.
            setPartners(data || []); // Set fetched data to state.
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const validateForm = () => {
        // Validate the new donation form inputs.
        const errors = {};
        if (!newDonation.donor_name.trim()) errors.donor_name = 'Donor name is required';
        if (!newDonation.category) errors.category = 'Category is required';
        if (!newDonation.food_items.trim()) errors.food_items = 'Food items are required';
        if (!newDonation.quantity || newDonation.quantity <= 0) errors.quantity = 'Valid quantity is required';
        setFormErrors(errors); // Update validation errors in state.
        return Object.keys(errors).length === 0; // Return whether the form is valid.
    };

    const showAlert = (message, severity = 'success') => {
        // Display an alert message.
        setAlert({ show: true, message, severity });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, show: false })); // Hide the alert after 6 seconds.
        }, 6000);
    };

    const handleAddDonation = async () => {
        // Handle adding a new donation.
        if (!validateForm()) {
            showAlert('Please fill in all required fields correctly', 'error');
            return;
        }

        setLoading(true); // Show loading indicator.
        try {
            // Insert new donation into the database.
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .insert([{ ...newDonation, quantity: parseInt(newDonation.quantity) }])
                .select();

            if (donationError) throw donationError; // Handle any errors.

            // Update the inventory with the donation details.
            const { error: inventoryError } = await supabase
                .from('inventory')
                .insert([{
                    product_name: newDonation.food_items,
                    category: newDonation.category,
                    quantity: parseInt(newDonation.quantity),
                    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Set expiry date to 7 days from now.
                    price: 0,
                    status: 'available',
                    donor: newDonation.donor_name
                }]);

            if (inventoryError) throw inventoryError;

            // Show success message and reset form.
            showAlert('Donation added successfully!');
            setDonations([...donations, donationData[0]]);
            setNewDonation({ donor_name: '', category: '', food_items: '', quantity: '', status: 'pending' });
            setOpen(false); // Close the dialog.
        } catch (error) {
            console.error('Error adding donation:', error);
            showAlert('Error adding donation', 'error'); // Show error alert.
        } finally {
            setLoading(false); // Hide loading indicator.
        }
    };

    const handleInputChange = (field) => (event) => {
        // Update the form inputs dynamically.
        setNewDonation(prev => ({ ...prev, [field]: event.target.value }));
        // Clear validation error for the specific field.
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Display alert message if any */}
            {alert.show && (
                <Alert
                    severity={alert.severity}
                    sx={{ mb: 2 }}
                    onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                >
                    {alert.message}
                </Alert>
            )}

            {/* Summary cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Active Deals</Typography>
                            <Typography variant="h3">{donations.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Partner Organizations</Typography>
                            <Typography variant="h3">{partners.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Pending Donations</Typography>
                            <Typography variant="h3">{donations.filter(d => d.status === 'pending').length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Add Donation Button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpen(true)}
                >
                    Create Deal
                </Button>
            </Box>

            {/* List of Donations */}
            <div container spacing={3} className='container'>
                <div className="row">
               
                {inventory.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Fade in timeout={500 + index * 100}>
                            <Card 
                                sx={{ 
                                    borderRadius: 3,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)'
                                    }
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        height: 140, 
                                        background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            position: 'absolute',
                                            bottom: 16,
                                            left: 16,
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                    {item.product_name}
                                </Typography>
                                </Box>
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Chip 
                                            label={item.status}
                                            sx={{
                                                backgroundColor: item.status === 'available' ? '#4CAF50' :
                                                              item.status === 'near-expiry' ? '#FF9800' : '#F44336',
                                                color: 'white'
                                            }}
                                        />
                                    </Box>
                                    
                                    {/* Price section with enhanced styling */}
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                                        <Typography variant="h4" component="span" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                            ₹{item.discounted_price || item.price}
                                        </Typography>
                                        {item.discounted_price && (
                                            <Typography
                                                variant="subtitle1" 
                                                component="span" 
                                                sx={{
                                                    textDecoration: 'line-through',
                                                    color: 'text.secondary',
                                                    ml: 1
                                                }}
                                            >
                                                ₹{item.price}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Other details with icons */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2">
                                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
                                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                                    </Typography>
                                        <Typography variant="body2">
                                            <PersonIcon sx={{ fontSize: 16, mr: 1 }} />
                                            {item.donor || 'Anonymous'}
                                </Typography>
                                    </Box>
                            </CardContent>
                        </Card>
                        </Fade>
                    </Grid>
                ))}
            </div>
            </div>

            {/* New Donation Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
        <TextField
            fullWidth
            label="Donor's Name"
            margin="normal"
            value={newItem.donor_name}
            onChange={(e) => setNewItem({...newItem, donor_name: e.target.value})}
            required
          />
          <TextField
            fullWidth
            label="Product Name"
            margin="normal"
            value={newItem.product_name}
            onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
            required
          />
          <TextField
            select
            fullWidth
            label="Category"
            margin="normal"
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
            required
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            margin="normal"
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
            required
          />
          <TextField
            fullWidth
            label="Expiry Date"
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={newItem.expiry_date}
            onChange={(e) => setNewItem({...newItem, expiry_date: e.target.value})}
            required
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
            required
          />
          <TextField
            fullWidth
            label="Location"
            margin="normal"
            value={newItem.location}
            onChange={(e) => setNewItem({...newItem, location: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
        </Container>
    );
};

export default Donations;