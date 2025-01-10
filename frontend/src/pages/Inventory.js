import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
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
  
    // Listen for the custom event
    const handleInventoryUpdate = () => {
      console.log('Inventory update detected');
      fetchInventory();
    };
  
    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
  
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
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
      {user && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpen(true)}
          sx={{ mb: 2 }}
        >
          Add New Item
        </Button>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><Typography fontWeight="bold">Product Name</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Category</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Quantity</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Expiry Date</Typography></TableCell>
              <TableCell><Typography fontWeight="bold">Source</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell><Typography fontWeight="bold">{item.product_name}</Typography></TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <span style={{ 
                    color: item.status === 'available' ? 'green' : 
                           item.status === 'near-expiry' ? 'orange' : 'red' 
                  }}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                <TableCell>{item.donor ? `Donated by ${item.donor}` : 'Added by Admin'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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