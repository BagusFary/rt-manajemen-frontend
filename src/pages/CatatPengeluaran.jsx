import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Swal from 'sweetalert2';
import api from '../services/api';

const CatatPengeluaran = () => {
    const [loading, setLoading] = useState(false);
    const [listPengeluaran, setListPengeluaran] = useState([]);
    const [formData, setFormData] = useState({
        deskripsi: '',
        jumlah: '',
        tanggal_pengeluaran: new Date().toISOString().split('T')[0]
    });

    // Ambil data pengeluaran (kita buat function fetch-nya nanti di backend)
    const fetchPengeluaran = async () => {
        try {
            const response = await api.get('/keuangan/pengeluaran'); // Sesuaikan endpoint
            setListPengeluaran(response.data.data);
        } catch (error) {
            console.error('Gagal memuat data:', error);
        }
    };

    useEffect(() => {
        fetchPengeluaran();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/keuangan/pengeluaran', formData);
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pengeluaran dicatat.', timer: 2000 });
            setFormData({ deskripsi: '', jumlah: '', tanggal_pengeluaran: new Date().toISOString().split('T')[0] });
            fetchPengeluaran();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Catat Pengeluaran Kas</Typography>

            <Grid container spacing={3}>
                {/* FORM INPUT */}
                <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Form Pengeluaran</Typography>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Deskripsi" required value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth type="number" label="Jumlah (Rp)" required value={formData.jumlah} onChange={(e) => setFormData({...formData, jumlah: e.target.value})} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth type="date" label="Tanggal Pengeluaran" InputLabelProps={{ shrink: true }} required value={formData.tanggal_pengeluaran} onChange={(e) => setFormData({...formData, tanggal_pengeluaran: e.target.value})} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button type="submit" variant="contained" color="error" fullWidth disabled={loading}>
                                            {loading ? 'Proses...' : 'Simpan Pengeluaran'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* TABEL HISTORI */}
                <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Riwayat Pengeluaran</Typography>
                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Tanggal Pengeluaran</TableCell>
                                            <TableCell>Deskripsi</TableCell>
                                            <TableCell>Jumlah</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {listPengeluaran.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.tanggal_pengeluaran}</TableCell>
                                                <TableCell>{item.deskripsi}</TableCell>
                                                <TableCell>Rp {parseInt(item.jumlah).toLocaleString('id-ID')}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CatatPengeluaran;