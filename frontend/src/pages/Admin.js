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
        // Set up real-time subscription
        const subscription = supabase
            .channel('donations_changes')
            .on('postgres_changes', 
                {
                    event: '*',
                    schema: 'public',
                    table: 'donations'
                },
                (payload) => {
                    fetchDonations();
                    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
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
            // Update donation status
            const { error: donationError } = await supabase
                .from('donations')
                .update({ status: newStatus })
                .eq('id', donationId);

            if (donationError) throw donationError;

            // Update corresponding inventory item
            const { error: inventoryError } = await supabase
                .from('inventory')
                .update({ status: newStatus })
                .eq('donor_id', donationId);

            if (inventoryError) throw inventoryError;

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
                                    <TableCell style={{ fontWeight: 'bold', backgroundColor: 'f5f5f5' }}>Donor</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', backgroundColor: 'f5f5f5' }}>Items</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', backgroundColor: 'f5f5f5' }}>Quantity</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', backgroundColor: 'f5f5f5' }}>Status</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', backgroundColor: 'f5f5f5' }}>Date</TableCell>
                                    <TableCell style={{ fontWeight: 'bold', backgroundColor: 'f5f5f5' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {donations.map((donation) => (
                                    <TableRow key={donation.id}>
                                        <TableCell>{donation.donor_name}</TableCell>
                                        <TableCell>{donation.food_items}</TableCell>
                                        <TableCell>{donation.quantity}</TableCell>
                                        <TableCell>
                                            <span style={{
                                                color: donation.status === 'completed' ? 'green' : 
                                                       donation.status === 'pending' ? 'orange' : 'inherit'
                                            }}>
                                                {donation.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                disabled={donation.status === 'completed' || loading}
                                                onClick={() => handleStatusChange(donation.id, 'completed')}
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