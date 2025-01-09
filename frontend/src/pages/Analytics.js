import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box
} from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { supabase } from '../config/supabase';

const Analytics = () => {
    const [stats, setStats] = useState({
        costSaving: 0,
        foodLossValue: 0,
        itemsSold: 0,
        wasteReduction: 0
    });
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [categoryLoss, setCategoryLoss] = useState([]);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            // Fetch basic stats
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('*');

            if (inventoryError) throw inventoryError;

            // Calculate stats
            const costSaving = calculateCostSavings(inventoryData);
            const foodLossValue = calculateFoodLossValue(inventoryData);
            const itemsSold = inventoryData.filter(item => item.status === 'sold').length;
            const wasteReduction = calculateWasteReduction(inventoryData);

            setStats({
                costSaving,
                foodLossValue,
                itemsSold,
                wasteReduction
            });

            // Calculate monthly trends
            const trends = calculateMonthlyTrends(inventoryData);
            setMonthlyTrends(trends);

            // Calculate category-wise loss
            const categoryData = calculateCategoryLoss(inventoryData);
            setCategoryLoss(categoryData);

        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    };

    const calculateCostSavings = (data) => {
        return data.reduce((sum, item) => {
            // Calculate savings from discounted sales
            if (item.status === 'sold' && item.discounted_price) {
                // Original revenue would have been price * quantity
                const originalRevenue = item.price * item.quantity;
                // Actual revenue is discounted_price * quantity
                const actualRevenue = item.discounted_price * item.quantity;
                // Loss prevented is the difference between throwing away (0 revenue) 
                // and selling at discount
                return sum + actualRevenue;
            }
            return sum;
        }, 0);
    };

    const calculateDaysLeft = (expiryDate) => {
        const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days;
    };

    const calculateFoodLossValue = (data) => {
        return data.reduce((sum, item) => {
            // Calculate value of expired items
            if (item.status === 'expired') {
                return sum + (item.price * item.quantity);
            }
            // Add value of items that will expire within 3 days
            else if (item.status === 'near-expiry') {
                const daysToExpiry = calculateDaysLeft(item.expiry_date);
                if (daysToExpiry <= 3) {
                    return sum + (item.price * item.quantity);
                }
            }
            return sum;
        }, 0);
    };

    const calculateWasteReduction = (data) => {
        const totalItems = data.reduce((sum, item) => sum + item.quantity, 0);
        const savedItems = data.reduce((sum, item) => {
            if (item.status === 'sold' || item.status === 'donated') {
                return sum + item.quantity;
            }
            return sum;
        }, 0);
        return totalItems > 0 ? (savedItems / totalItems) * 100 : 0;
    };

    const calculateMonthlyTrends = (data) => {
        const months = {};
        const foodLoss = {};
        const costSavings = {};

        // Initialize arrays for each month
        for (let i = 0; i < 12; i++) {
            const monthName = new Date(2024, i).toLocaleString('default', { month: 'short' });
            months[i] = monthName;
            foodLoss[monthName] = 0;
            costSavings[monthName] = 0;
        }

        // Calculate values for each month
        data.forEach(item => {
            const date = new Date(item.created_at);
            const monthName = date.toLocaleString('default', { month: 'short' });

            if (item.status === 'expired') {
                foodLoss[monthName] += item.price * item.quantity;
            }
            if (item.status === 'sold' && item.discounted_price) {
                costSavings[monthName] += (item.price - item.discounted_price) * item.quantity;
            }
        });

        // Format data for the line chart
        return [
            {
                id: "Food Loss",
                data: Object.entries(foodLoss).map(([x, y]) => ({ x, y }))
            },
            {
                id: "Cost Savings",
                data: Object.entries(costSavings).map(([x, y]) => ({ x, y }))
            }
        ];
    };

    const calculateCategoryLoss = (data) => {
        const categoryLoss = {};

        // Calculate loss for each category
        data.forEach(item => {
            if (item.status === 'expired') {
                const loss = item.price * item.quantity;
                categoryLoss[item.category] = (categoryLoss[item.category] || 0) + loss;
            }
        });

        // Format data for the pie chart
        return Object.entries(categoryLoss).map(([category, value]) => ({
            id: category,
            label: category,
            value: parseFloat(value.toFixed(2))
        }));
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Cost Savings
                            </Typography>
                            <Typography variant="h3" color="success.main">
                                ${stats.costSaving.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Food Loss Value
                            </Typography>
                            <Typography variant="h3" color="error.main">
                                ${stats.foodLossValue.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Items Sold
                            </Typography>
                            <Typography variant="h3" color="primary.main">
                                {stats.itemsSold}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Waste Reduction
                            </Typography>
                            <Typography variant="h3" color="success.main">
                                {stats.wasteReduction.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Monthly Trends
                            </Typography>
                            <Box sx={{ height: 400 }}>
                                <ResponsiveLine
                                    data={monthlyTrends}
                                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                                    xScale={{ type: 'point' }}
                                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                                    axisTop={null}
                                    axisRight={null}
                                    axisBottom={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: 'Month',
                                        legendOffset: 36,
                                        legendPosition: 'middle'
                                    }}
                                    axisLeft={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: 'Value ($)',
                                        legendOffset: -40,
                                        legendPosition: 'middle'
                                    }}
                                    pointSize={10}
                                    pointColor={{ theme: 'background' }}
                                    pointBorderWidth={2}
                                    pointBorderColor={{ from: 'serieColor' }}
                                    pointLabelYOffset={-12}
                                    useMesh={true}
                                    legends={[
                                        {
                                            anchor: 'bottom-right',
                                            direction: 'column',
                                            justify: false,
                                            translateX: 100,
                                            translateY: 0,
                                            itemsSpacing: 0,
                                            itemDirection: 'left-to-right',
                                            itemWidth: 80,
                                            itemHeight: 20,
                                            itemOpacity: 0.75,
                                            symbolSize: 12,
                                            symbolShape: 'circle',
                                            symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                            effects: [
                                                {
                                                    on: 'hover',
                                                    style: {
                                                        itemBackground: 'rgba(0, 0, 0, .03)',
                                                        itemOpacity: 1
                                                    }
                                                }
                                            ]
                                        }
                                    ]}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Loss by Category
                            </Typography>
                            <Box sx={{ height: 400 }}>
                                <ResponsivePie
                                    data={categoryLoss}
                                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                                    innerRadius={0.5}
                                    padAngle={0.7}
                                    cornerRadius={3}
                                    activeOuterRadiusOffset={8}
                                    borderWidth={1}
                                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                                    arcLinkLabelsSkipAngle={10}
                                    arcLinkLabelsTextColor="#333333"
                                    arcLinkLabelsThickness={2}
                                    arcLinkLabelsColor={{ from: 'color' }}
                                    arcLabelsSkipAngle={10}
                                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                                    legends={[
                                        {
                                            anchor: 'bottom',
                                            direction: 'row',
                                            justify: false,
                                            translateX: 0,
                                            translateY: 56,
                                            itemsSpacing: 0,
                                            itemWidth: 100,
                                            itemHeight: 18,
                                            itemTextColor: '#999',
                                            itemDirection: 'left-to-right',
                                            itemOpacity: 1,
                                            symbolSize: 18,
                                            symbolShape: 'circle'
                                        }
                                    ]}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Analytics; 