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
    TextField,
    Box,
    Fade,
    LinearProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { supabase } from '../config/supabase';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';

const Dashboard = () => {
    const [stats, setStats] = useState({
        nearExpiry: 0,
        totalDonations: 0,
        totalValue: 0
    });
    const [nearExpiryItems, setNearExpiryItems] = useState([]);
    const [recentDonors, setRecentDonors] = useState([]);
    const [nearExpiryValue, setNearExpiryValue] = useState(0);

    useEffect(() => {
        fetchDashboardData();

        // Listen for inventory updates
        const handleInventoryUpdate = () => {
            fetchDashboardData();
        };

        window.addEventListener('inventoryUpdated', handleInventoryUpdate);

        // Set up real-time subscription
        const subscription = supabase
            .channel('inventory_changes')
            .on('postgres_changes', 
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory'
                },
                (payload) => {
                    fetchDashboardData();
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
            subscription.unsubscribe();
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            // First, get all pending items regardless of expiry date
            const { data: pendingItems, error: pendingError } = await supabase
                .from('inventory')
                .select('*')
                .eq('status', 'pending');

            if (pendingError) throw pendingError;

            // Calculate total value of pending items
            const pendingValue = pendingItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Get near expiry items (available status)
            const tenDaysFromNow = new Date();
            tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

            const { data: expiryData, error: expiryError } = await supabase
                .from('inventory')
                .select('*')
                .lte('expiry_date', tenDaysFromNow.toISOString())
                .gte('expiry_date', new Date().toISOString())
                .eq('status', 'available')
                .order('expiry_date', { ascending: true });

            if (expiryError) throw expiryError;

            // Calculate total value of near expiry items
            const expiryValue = expiryData.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            // Total value at risk is sum of pending and near expiry values
            const totalRiskValue = pendingValue + expiryValue;

            setNearExpiryItems([...pendingItems, ...expiryData]);
            setNearExpiryValue(totalRiskValue);

            // Fetch recent donations
            const { data: recentDeals, error: recentError } = await supabase
                .from('donations')
                .select(`
                    id,
                    donor_name,
                    food_items,
                    created_at,
                    status,
                    quantity,
                    price
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            setRecentDonors(recentDeals);

            // Fetch donations for total count
            const { data: donationData, error: donationError } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (donationError) throw donationError;

            setStats({
                nearExpiry: expiryData.length,
                totalDonations: donationData.length,
                totalValue: totalRiskValue
            });

            // Log pending items for debugging
            console.log('Pending Items:', pendingItems);
            console.log('Pending Value:', pendingValue);
            console.log('Total Risk Value:', totalRiskValue);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Fade in timeout={1000}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                            }}
                        >
                        <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>TOTAL DONATIONS</Typography>
                                        <Typography variant="h4">{stats.totalDonations}</Typography>
                                        <Typography variant="subtitle2" sx={{ color: '#4CAF50' }}>
                                            +{Math.round(stats.totalDonations * 0.1)} this week
                            </Typography>
                                    </Box>
                                    <IconButton sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        <TrendingUpIcon />
                                    </IconButton>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={70} 
                                    sx={{ 
                                        mt: 2, 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: 'white'
                                        }
                                    }} 
                                />
                        </CardContent>
                    </Card>
                </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                            }}
                        >
                        <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>ITEMS NEAR EXPIRY</Typography>
                                        <Typography variant="h4">{stats.nearExpiry}</Typography>
                                        <Typography variant="subtitle2" sx={{ color: '#FF9800' }}>
                                            +{Math.round(stats.nearExpiry * 0.1)} this week
                            </Typography>
                                    </Box>
                                    <IconButton sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        <InventoryIcon />
                                    </IconButton>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={50} 
                                    sx={{ 
                                        mt: 2, 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: 'white'
                                        }
                                    }} 
                                />
                        </CardContent>
                    </Card>
                </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #FFD740 0%, #FFC107 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                            }}
                        >
                        <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>TOTAL VALUE AT RISK</Typography>
                                        <Typography variant="h4">₹{stats.totalValue.toFixed(2)}</Typography>
                                        <Typography variant="subtitle2" sx={{ color: '#F44336' }}>
                                            -{Math.round(stats.totalValue * 0.05)} this week
                            </Typography>
                                    </Box>
                                    <IconButton sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        <TimelineIcon />
                                    </IconButton>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={30} 
                                    sx={{ 
                                        mt: 2, 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: 'white'
                                        }
                                    }} 
                                />
                        </CardContent>
                    </Card>
                </Grid>
                
                    <Grid item xs={12} sm={6} md={3}>
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>ACTIVE DONORS</Typography>
                                        <Typography variant="h4">{recentDonors.length}</Typography>
                                        <Typography variant="subtitle2" sx={{ color: '#4CAF50' }}>
                                            +{Math.round(recentDonors.length * 0.05)} this week
                                        </Typography>
                                    </Box>
                                    <IconButton sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        <GroupsIcon />
                                    </IconButton>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={80} 
                                    sx={{ 
                                        mt: 2, 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: 'white'
                                        }
                                    }} 
                                />
                            </CardContent>
                        </Card>
                    </Grid>
            </Grid>
            </Fade>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card 
                        sx={{ 
                            mt: 4, 
                            borderRadius: 3,
                            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)', color: 'white' }}>
                            <Typography variant="h5">Near Expiry Items</Typography>
                            <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                                Items requiring immediate attention
                    </Typography>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Days Left</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Original Price</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Discounted Price</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Discount</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {nearExpiryItems.map((item) => {
                                    const daysLeft = Math.ceil(
                                        (new Date(item.expiry_date) - new Date()) / 
                                        (1000 * 60 * 60 * 24)
                                    );
                                    const discount = daysLeft <= 10 ? (10 - daysLeft + 1) * 5 : 0;
                                    const discountedPrice = item.price * (1 - discount/100);
                                    
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product_name}</TableCell>
                                            <TableCell>
                                                <span style={{
                                                    color: daysLeft <= 3 ? 'red' : 
                                                           daysLeft <= 7 ? 'orange' : 'green',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {daysLeft} days
                                                </span>
                                            </TableCell>
                                            <TableCell>₹{item.price.toFixed(2)}</TableCell>
                                            <TableCell>₹{discountedPrice.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span style={{ color: 'red', fontWeight: 'bold' }}>
                                                    {discount}%
                                                </span>
                                            </TableCell>
                                                <TableCell>
                                                    <Tooltip title="View Details">
                                                        <IconButton>
                                                            <InfoIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Recent Deals
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentDonors.map((deal) => (
                                    <TableRow key={deal.id}>
                                        <TableCell>{deal.donor_name}</TableCell>
                                        <TableCell>{deal.food_items}</TableCell>
                                        <TableCell>{deal.quantity}</TableCell>
                                        <TableCell>
                                            <span style={{
                                                color: deal.status === 'completed' ? 'green' : 
                                                       deal.status === 'pending' ? 'orange' : 'inherit'
                                            }}>
                                                {deal.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(deal.created_at).toLocaleDateString()}
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