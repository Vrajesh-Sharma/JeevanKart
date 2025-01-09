import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Alert
} from '@mui/material';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  const [newItem, setNewItem] = useState({
    product_name: '',
    category: '',
    quantity: 0,
    expiry_date: '',
    price: 0,
    location: ''
  });

  const categories = ['fruits', 'vegetables', 'dairy', 'bakery', 'meat', 'other'];

  useEffect(() => {
    fetchInventory();
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
      const requiredFields = ['product_name', 'category', 'quantity', 'expiry_date', 'price'];
      const missingFields = requiredFields.filter(field => !newItem[field]);
      
      if (missingFields.length > 0) {
        setAlert({
          show: true,
          message: `Please fill in all required fields: ${missingFields.join(', ')}`,
          severity: 'error'
        });
        return;
      }

      const formattedItem = {
        ...newItem,
        quantity: Number(newItem.quantity),
        price: Number(newItem.price),
        expiry_date: new Date(newItem.expiry_date).toISOString(),
        status: 'available'
      };

      const { data, error } = await supabase
        .from('inventory')
        .insert([formattedItem])
        .select();

      if (error) throw error;

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
        location: ''
      });
      fetchInventory();
    } catch (error) {
      console.error('Error adding item:', error);
      setAlert({
        show: true,
        message: error.message || 'Error adding item',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}
      <Grid container spacing={3}>
        {user && (
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setOpen(true)}
            >
              Add New Item
            </Button>
          </Grid>
        )}
        {inventory.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.product_name}
                </Typography>
                <Typography>Category: {item.category}</Typography>
                <Typography>Quantity: {item.quantity}</Typography>
                <Typography>
                  Status: 
                  <span style={{ 
                    color: item.status === 'available' ? 'green' : 
                           item.status === 'near-expiry' ? 'orange' : 'red' 
                  }}>
                    {item.status}
                  </span>
                </Typography>
                {item.price > 0 && (
                  <Typography>
                    Price: ${item.price}
                    {item.discounted_price && (
                      <span style={{ color: 'red', marginLeft: '10px' }}>
                        Discounted: ${item.discounted_price}
                      </span>
                    )}
                  </Typography>
                )}
                <Typography>
                  Expiry: {new Date(item.expiry_date).toLocaleDateString()}
                </Typography>
                <Typography>
                  Source: {item.donor ? `Donated by ${item.donor}` : 'Added by Admin'}
                </Typography>
                {item.location && (
                  <Typography>Location: {item.location}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Inventory Item</DialogTitle>
        <DialogContent>
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

export default Inventory; 