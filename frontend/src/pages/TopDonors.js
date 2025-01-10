import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Avatar
} from '@mui/material';
import { supabase } from '../config/supabase';

const TopDonors = () => {
    const [topDonors, setTopDonors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTopDonors();

        const subscription = supabase
            .channel('donations_changes')
            .on('postgres_changes', 
                {
                    event: '*',
                    schema: 'public',
                    table: 'donations'
                },
                () => {
                    fetchTopDonors();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchTopDonors = async () => {
        try {
            setLoading(true);
            // Fetch all donations
            const { data: donations, error } = await supabase
                .from('donations')
                .select('*');

            if (error) throw error;

            // Calculate total donation value for each donor
            const donorStats = donations.reduce((acc, donation) => {
                const donor = donation.donor_name;
                if (!acc[donor]) {
                    acc[donor] = {
                        totalValue: 0,
                        totalItems: 0,
                        lastDonation: donation.created_at,
                        completedDonations: 0
                    };
                }
                acc[donor].totalValue += donation.price * donation.quantity;
                acc[donor].totalItems += donation.quantity;
                acc[donor].lastDonation = new Date(Math.max(
                    new Date(acc[donor].lastDonation),
                    new Date(donation.created_at)
                ));
                if (donation.status === 'completed') {
                    acc[donor].completedDonations += 1;
                }
                return acc;
            }, {});

            // Convert to array and sort by total value
            const sortedDonors = Object.entries(donorStats)
                .map(([name, stats]) => ({
                    name,
                    ...stats,
                    avgDonationValue: stats.totalValue / stats.totalItems
                }))
                .sort((a, b) => b.totalValue - a.totalValue);

            setTopDonors(sortedDonors);
        } catch (error) {
            console.error('Error fetching top donors:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Top Donors
            </Typography>

            {/* Top 3 Donors Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {topDonors.slice(0, 3).map((donor, index) => (
                    <Card 
                        key={donor.name}
                        sx={{ 
                            flex: 1, 
                            minWidth: 300,
                            background: index === 0 ? 'linear-gradient(45deg, #FFD700 30%, #FFC400 90%)' :
                                       index === 1 ? 'linear-gradient(45deg, #C0C0C0 30%, #B4B4B4 90%)' :
                                       'linear-gradient(45deg, #CD7F32 30%, #B87333 90%)',
                            color: 'white'
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                    sx={{ 
                                        width: 60, 
                                        height: 60,
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        marginRight: 2
                                    }}
                                >
                                    {donor.name.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">{donor.name}</Typography>
                                    <Typography variant="subtitle1">
                                        #{index + 1} Top Donor
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="h4" sx={{ mb: 1 }}>
                                ₹{donor.totalValue.toFixed(2)}
                            </Typography>
                            <Typography>
                                Total Items: {donor.totalItems}
                            </Typography>
                            <Typography>
                                Completed Donations: {donor.completedDonations}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Detailed Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Rank</TableCell>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Donor Name</TableCell>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Total Value</TableCell>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Total Items</TableCell>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Avg. Value/Item</TableCell>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Completed Donations</TableCell>
                            <TableCell style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Last Donation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {topDonors.map((donor, index) => (
                            <TableRow 
                                key={donor.name}
                                sx={{
                                    backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'inherit'
                                }}
                            >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{donor.name}</TableCell>
                                <TableCell>₹{donor.totalValue.toFixed(2)}</TableCell>
                                <TableCell>{donor.totalItems}</TableCell>
                                <TableCell>₹{donor.avgDonationValue.toFixed(2)}</TableCell>
                                <TableCell>{donor.completedDonations}</TableCell>
                                <TableCell>
                                    {new Date(donor.lastDonation).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default TopDonors;