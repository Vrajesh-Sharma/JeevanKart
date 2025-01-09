import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { supabase } from '../config/supabase';

const Admin = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDonations();
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
        }
    };

    const handleStatusChange = async (donationId, newStatus) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('donations')
                .update({ status: newStatus })
                .eq('id', donationId);

            if (error) throw error;
            fetchDonations();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Manage Donations
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Donor</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {donations.map((donation) => (
                                    <TableRow key={donation.id}>
                                        <TableCell>{donation.donor_name}</TableCell>
                                        <TableCell>{donation.food_items}</TableCell>
                                        <TableCell>{donation.quantity}</TableCell>
                                        <TableCell>
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <FormControl size="small">
                                                <Select
                                                    value={donation.status}
                                                    onChange={(e) => handleStatusChange(donation.id, e.target.value)}
                                                    disabled={loading}
                                                >
                                                    <MenuItem value="pending">Pending</MenuItem>
                                                    <MenuItem value="completed">Completed</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleStatusChange(donation.id, 'completed')}
                                                disabled={loading || donation.status === 'completed'}
                                            >
                                                Mark Complete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Admin; 