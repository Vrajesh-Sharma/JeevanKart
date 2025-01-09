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
    Paper
} from '@mui/material';
import { supabase } from '../config/supabase';

const Dashboard = () => {
    const [stats, setStats] = useState({
        nearExpiry: 0,
        totalDonations: 0,
        totalValue: 0
    });
    const [nearExpiryItems, setNearExpiryItems] = useState([]);
    const [recentDonors, setRecentDonors] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch near expiry items
            const { data: expiryData, error: expiryError } = await supabase
                .from('inventory')
                .select('*')
                .eq('status', 'near-expiry')
                .order('expiry_date', { ascending: true });

            if (expiryError) throw expiryError;

            // Fetch recent donations
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (donationError) throw donationError;

            setNearExpiryItems(expiryData);
            setRecentDonors(donationData);
            setStats({
                nearExpiry: expiryData.length,
                totalDonations: donationData.length,
                totalValue: calculateTotalValue(expiryData)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const calculateTotalValue = (items) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateDaysLeft = (expiryDate) => {
        const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Items Near Expiry
                            </Typography>
                            <Typography variant="h3" color="error">
                                {stats.nearExpiry}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Donations
                            </Typography>
                            <Typography variant="h3" color="primary">
                                {stats.totalDonations}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Value at Risk
                            </Typography>
                            <Typography variant="h3" color="warning.main">
                                ${stats.totalValue.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Near Expiry Items
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Days Left</TableCell>
                                    <TableCell>Discount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {nearExpiryItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{calculateDaysLeft(item.expiry_date)}</TableCell>
                                        <TableCell>
                                            {((item.price - item.discounted_price) / item.price * 100).toFixed(0)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Recent Donors
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Donor</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentDonors.map((donor) => (
                                    <TableRow key={donor.id}>
                                        <TableCell>{donor.donor_name}</TableCell>
                                        <TableCell>{donor.food_items}</TableCell>
                                        <TableCell>
                                            {new Date(donor.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 