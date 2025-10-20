import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import {
  Medication,
  AccountCircle,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const cards = [
    {
      title: 'Medications',
      description: 'Manage your medications',
      icon: <Medication sx={{ fontSize: 60 }} />,
      path: '/medications',
      color: '#667eea',
    },
    {
      title: 'Profile',
      description: 'Update your profile information',
      icon: <AccountCircle sx={{ fontSize: 60 }} />,
      path: '/profile',
      color: '#764ba2',
    },
  ];

  if (isAdmin()) {
    cards.push({
      title: 'Admin Panel',
      description: 'Manage users and system settings',
      icon: <AdminPanelSettings sx={{ fontSize: 60 }} />,
      path: '/admin',
      color: '#f50057',
    });
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.fullName || user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Role: <strong>{user?.role}</strong>
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.description}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(card.path)}
                    sx={{ backgroundColor: card.color }}
                  >
                    Go to {card.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
}

export default Dashboard;
