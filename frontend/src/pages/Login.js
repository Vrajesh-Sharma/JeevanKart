import React, { useState } from 'react';
import {
    Container,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Box,
    Tabs,
    Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'create'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // First check if email exists in admin_users table
            const { data: adminData, error: adminError } = await supabase
                .from('admin_users')
                .select('email')
                .eq('email', formData.email)
                .single();

            if (adminError || !adminData) {
                throw new Error('Invalid admin credentials');
            }

            // If admin exists, attempt login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            if (data?.user) {
                navigate('/admin');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            // Create admin user record
            const { error: adminError } = await supabase
                .from('admin_users')
                .insert([
                    {
                        email: formData.email,
                        full_name: formData.fullName
                    }
                ]);

            if (adminError) throw adminError;

            alert('Account created successfully! Please check your email for verification.');
            setMode('login');
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                fullName: ''
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom align="center">
                        Admin Portal
                    </Typography>

                    <Tabs
                        value={mode}
                        onChange={(e, newValue) => setMode(newValue)}
                        centered
                        sx={{ mb: 3 }}
                    >
                        <Tab label="Login" value="login" />
                        <Tab label="Create Account" value="create" />
                    </Tabs>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={mode === 'login' ? handleLogin : handleCreateAccount}
                    >
                        {mode === 'create' && (
                            <TextField
                                fullWidth
                                label="Full Name"
                                margin="normal"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        )}
                        <TextField
                            fullWidth
                            label="Admin Email"
                            type="email"
                            margin="normal"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            margin="normal"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        {mode === 'create' && (
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                margin="normal"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        )}
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading 
                                ? (mode === 'login' ? 'Logging in...' : 'Creating Account...') 
                                : (mode === 'login' ? 'Login' : 'Create Account')}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login; 