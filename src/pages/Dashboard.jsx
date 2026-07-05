import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import api from '../services/api';
import { Button, Box, Typography, Paper } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Dashboard() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Gagal logout di server:', error);
        } finally {
            dispatch(logout());
            navigate('/login', { replace: true });
        }
    };

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
            <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 2, maxWidth: 600 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Dashboard Manajemen RT
                </Typography>
                
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Selamat Datang, {user?.name || 'Pak RT'}!
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Anda telah berhasil login. Sesi Anda saat ini dilindungi oleh Redux Persist dan Bearer Token.
                </Typography>

                <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    size="large"
                >
                    Keluar Aplikasi
                </Button>
            </Paper>
        </Box>
    );
}