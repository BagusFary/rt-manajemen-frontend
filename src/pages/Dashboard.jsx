import { useSelector } from 'react-redux';
import { Box, Typography, Paper } from '@mui/material';

export default function Dashboard() {
    const user = useSelector((state) => state.auth.user);

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
            </Paper>
        </Box>
    );
}