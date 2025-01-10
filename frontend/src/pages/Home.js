import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" 
    sx={{
      backgroundColor: "rgba(195, 189, 189, 0.2)", 
      padding: 4,                
      borderRadius: "12px",      
    }}>
      <Box
        sx={{
          mt: 8,
          mb: 4,
          textAlign: 'center', 
          padding: 4, 
          borderRadius: '12px', 
          boxShadow: '0 4px 10px rgba(62, 61, 61, 0.2)', 
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography
          variant="h2"
          align="center"
          sx={{
            color: '#2e7d32', 
            fontWeight: 'bold',
            fontSize: '2.5rem',
          }}
          gutterBottom
        >
          Let's Save Lives
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: '#616161', 
            fontStyle: 'italic', 
            fontSize: '1.25rem',
            lineHeight: '1.6', 
          }}
          paragraph
        >
          Join us in our mission to minimize food waste and create a sustainable future
        </Typography>
      </Box>

      {/* New Section for Images/Videos */}
      <Box
        sx={{
          mb: 8,
          textAlign: 'center',
          padding: 4,
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(62, 61, 61, 0.2)',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold', 
            color: '#2e7d32', 
            marginBottom: 4, 
          }}
          gutterBottom
        >
          Our Impact in Action
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <img src="JeevanKart/frontend/src/assets/Food_waste.jpg" alt="Food Waste Reduction" style={{ width: '100%', height: 'auto' }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <iframe 
                width="100%" 
                height="315" 
                src="Frontend/src/Video.mp4" 
                title="YouTube video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', 
              transition: 'transform 0.3s, box-shadow 0.3s', 
              '&:hover': {
                transform: 'translateY(-10px)', 
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)', 
              },
              backgroundColor: '#f8f9fa ',
              borderRadius: '10px', 
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: '#00796b', 
                  fontWeight: 'bold', 
                }}
              >
                Our Mission
              </Typography>
              <Typography
                sx={{
                  color: '#333', 
                  fontSize: '1rem', 
                  lineHeight: '1.5', 
                }}
              >
                We're committed to reducing food waste in retail and e-commerce through
                smart inventory management and timely redistribution of surplus food </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              boxShadow: '0 4px 10px rgba(62, 61, 61, 0.2)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
              },
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: '#00796b',
                  fontWeight: 'bold',
                }}
              >
                Impact
              </Typography>
              <Typography
                sx={{
                  color: '#333',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                }}
              >
                Every year, 1.3 billion tons of food is wasted globally. Together, we can make
                a difference by saving food that would otherwise go to waste.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              boxShadow: '0 4px 10px rgba(62, 61, 61, 0.2)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
              },
              backgroundColor: '#f8f9fa',
              borderRadius: '10px',
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: '#00796b',
                  fontWeight: 'bold',
                }}
              >
                Join The Cause
              </Typography>
              <Typography
                sx={{
                  color: '#333',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                }}
              >
                Whether you're a retailer, charity, or concerned citizen, you can help reduce
                food waste and support those in need.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          mb: 8,
          padding: 4,
          backgroundColor: '#f9f9f9', 
          borderRadius: '12px', 
          boxShadow: '0 4px 10px rgba(62, 61, 61, 0.2)',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 'bold', 
            color: '#2e7d32', 
            marginBottom: 4, 
          }}
          gutterBottom
        >
          Key Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                padding: 2, 
                borderRadius: '8px', 
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#1976d2', 
                  fontWeight: 'bold', 
                }}
              >
                33%
              </Typography>
              <Typography
                sx={{
                  color: '#555', 
                  fontSize: '1rem', 
                }}
              >
                of food produced is lost or wasted
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                padding: 2, 
                borderRadius: '8px', 
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                }}
              >
                820M
              </Typography>
              <Typography
                sx={{
                  color: '#555',
                  fontSize: '1rem',
                }}
              >
                people suffer from hunger
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                padding: 2, borderRadius: '8px', 
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                }}
              >
                10-15%
              </Typography>
              <Typography
                sx={{
                  color: '#555',
                  fontSize: '1rem',
                }}
              >
                waste occurs at retail level
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                padding: 2, 
                borderRadius: '8px', 
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: '#1976d2',
                  fontWeight: 'bold',
                }}
              >
                25%
              </Typography>
              <Typography
                sx={{
                  color: '#555',
                  fontSize: '1rem',
                }}
              >
                reduction could feed all hungry
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          mb: 8,
          padding: 4, 
          backgroundColor: '#f4f4f4', 
          borderRadius: '12px', 
          boxShadow: '0 4px 10px rgba(62, 61, 61, 0.2)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold', 
            color: '#2e7d32', 
            marginBottom: 3, 
          }}
          gutterBottom
        >
          Take Action Now
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/donations')}>
          Create Deals
        </Button>
      </Box>

    </Container>
  );
};

export default Home;