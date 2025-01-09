import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" align="center" color="primary" gutterBottom>
          Reducing Food Loss Together
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Join us in our mission to minimize food waste and create a sustainable future
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Our Mission
              </Typography>
              <Typography>
                We're committed to reducing food waste in retail and e-commerce through
                smart inventory management and timely redistribution of surplus food.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Impact
              </Typography>
              <Typography>
                Every year, 1.3 billion tons of food is wasted globally. Together,
                we can make a difference by saving food that would otherwise go to waste.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                Join The Cause
              </Typography>
              <Typography>
                Whether you're a retailer, charity, or concerned citizen, you can
                help reduce food waste and support those in need.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Key Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="primary">
                33%
              </Typography>
              <Typography>
                of food produced is lost or wasted
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="primary">
                820M
              </Typography>
              <Typography>
                people suffer from hunger
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="primary">
                10-15%
              </Typography>
              <Typography>
                waste occurs at retail level
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box textAlign="center">
              <Typography variant="h3" color="primary">
                25%
              </Typography>
              <Typography>
                reduction could feed all hungry
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Take Action Now
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/inventory')}
          sx={{ mr: 2 }}
        >
          Manage Inventory
        </Button>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          onClick={() => navigate('/donations')}
        >
          View Donations
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 