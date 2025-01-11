import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Responsive check for medium screens or smaller

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
        handleClose();
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    const navLinks = [
        { text: 'Dashboard', path: '/dashboard' },
        { text: 'Inventory', path: '/inventory' },
        { text: 'Deals', path: '/donations' },
        { text: 'Analytics', path: '/analytics' },
        { text: 'Top Donors', path: '/top-donors' }
    ];

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        JeevanKart
                    </Typography>

                    {isMobile ? (
                        // Render hamburger menu on mobile screens
                        <>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={toggleDrawer(true)}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={toggleDrawer(false)}
                            >
                                <Box
                                    sx={{
                                        width: 250,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}
                                    role="presentation"
                                    onClick={toggleDrawer(false)}
                                    onKeyDown={toggleDrawer(false)}
                                >
                                    <List>
                                        {navLinks.map((link) => (
                                            <ListItem key={link.text} disablePadding>
                                                <ListItemButton
                                                    component={Link}
                                                    to={link.path}
                                                >
                                                    <ListItemText primary={link.text} />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                    {user ? (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    navigate('/admin');
                                                }}
                                                sx={{ mt: 2 }}
                                            >
                                                Admin Dashboard
                                            </Button>
                                            <Button
                                                onClick={handleLogout}
                                                sx={{ mt: 1 }}
                                            >
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            color="inherit"
                                            component={Link}
                                            to="/login"
                                            variant="outlined"
                                            sx={{
                                                mt: 2,
                                                borderColor: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                                }
                                            }}
                                        >
                                            Admin Login
                                        </Button>
                                    )}
                                </Box>
                            </Drawer>
                        </>
                    ) : (
                        // Render buttons for desktop screens
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.text}
                                    color="inherit"
                                    component={Link}
                                    to={link.path}
                                >
                                    {link.text}
                                </Button>
                            ))}
                            {user ? (
                                <>
                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleMenu}
                                        color="inherit"
                                    >
                                        <AccountCircleIcon />
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right'
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right'
                                        }}
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                    >
                                        <MenuItem
                                            onClick={() => {
                                                navigate('/admin');
                                                handleClose();
                                            }}
                                        >
                                            Admin Dashboard
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/login"
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'white',
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                        }
                                    }}
                                >
                                    Admin Login
                                </Button>
                            )}
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
