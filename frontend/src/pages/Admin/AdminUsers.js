import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { adminService } from '../../services';

const ROLES = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'error' },
  ADMIN: { label: 'Admin', color: 'warning' },
  MANAGER: { label: 'Manager', color: 'info' },
  DOCTOR: { label: 'Doctor', color: 'success' },
  STAFF: { label: 'Staff', color: 'default' },
  PATIENT: { label: 'Patient', color: 'primary' },
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data.users || data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await adminService.updateRole(selectedUser._id, newRole);
      setSuccess(`Role updated successfully for ${selectedUser.username}`);
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(err || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleStatus(user._id);
      setSuccess(
        `User ${user.isActive ? 'deactivated' : 'activated'} successfully`
      );
      fetchUsers();
    } catch (err) {
      setError(err || 'Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Full Name</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.fullName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={ROLES[user.role]?.label || user.role}
                        color={ROLES[user.role]?.color || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenRoleDialog(user)}
                        title="Change Role"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color={user.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleStatus(user)}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Change Role Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                User: <strong>{selectedUser?.username}</strong>
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                Current Role: <strong>{selectedUser?.role}</strong>
              </Typography>
              <Select
                fullWidth
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateRole}
              variant="contained"
              disabled={!newRole || newRole === selectedUser?.role}
            >
              Update Role
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export default AdminUsers;
