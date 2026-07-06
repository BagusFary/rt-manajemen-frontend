import { useState, useEffect } from 'react';
import { 
    Box, Typography, Card, CardContent, Grid, MenuItem, 
    Select, InputLabel, FormControl, Button, Checkbox, 
    FormControlLabel, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import Swal from 'sweetalert2';
import api from '../services/api'; 

const TransaksiIuran = () => {
    const [listRumah, setListRumah] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);

    const [formData, setFormData] = useState({
        rumah_id: '',
        penghuni_id: '',
        jenis_iuran: 'kebersihan',
        tahun: new Date().getFullYear(),
        bulan: new Date().getMonth() + 1, 
        bayar_setahun: false
    });

    useEffect(() => {
        const fetchRumahDihuni = async () => {
            try {
                const response = await api.get('/rumah', { params: { status_rumah: 'dihuni', per_page: 100 } });
                setListRumah(response.data.data.data || response.data.data);
            } catch (error) {
                console.error('Gagal mengambil data rumah:', error);
            }
        };
        fetchRumahDihuni();
    }, []);

    const fetchHistoryPembayaran = async (rumahId) => {
        setLoadingHistory(true);
        try {
            const response = await api.get(`/rumah/${rumahId}/pembayaran`);
            setHistoryData(response.data.data || []);
        } catch (error) {
            console.error('Gagal mengambil history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleRumahChange = (e) => {
        const selectedId = e.target.value;
        const rumah = listRumah.find(r => r.id === selectedId);
        const penghuniAktif = rumah?.riwayat_penghuni?.find(r => r.tanggal_keluar === null);

        setFormData({
            ...formData,
            rumah_id: selectedId,
            penghuni_id: penghuniAktif ? penghuniAktif.penghuni_id : ''
        });

        fetchHistoryPembayaran(selectedId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.penghuni_id) {
            Swal.fire('Peringatan', 'Rumah ini tidak memiliki penghuni aktif.', 'warning');
            return;
        }

        setLoading(true);
        try {
            await api.post('/keuangan/bayar-iuran', formData);
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pembayaran dicatat.', timer: 2000, showConfirmButton: false });
            
            setFormData({ ...formData, bayar_setahun: false, bulan: new Date().getMonth() + 1 });
            fetchHistoryPembayaran(formData.rumah_id);
            
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTagihan = async () => {
        const confirm = await Swal.fire({
            title: 'Generate Tagihan Massal?',
            text: "Sistem akan membuat tagihan (Kebersihan & Satpam) bulan ini untuk SELURUH rumah yang memiliki penghuni aktif. Lanjutkan?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Generate!'
        });

        if (confirm.isConfirmed) {
            setIsGenerating(true);
            try {
                const response = await api.post('/keuangan/generate-tagihan');
                
                const jumlah = response.data.data || response.data.tagihan_dibuat || 'Beberapa'; 
                
                Swal.fire(
                    'Berhasil!',
                    `${jumlah} tagihan baru berhasil di-generate untuk bulan ini.`,
                    'success'
                );

                if (formData.rumah_id) {
                    fetchHistoryPembayaran(formData.rumah_id);
                }
            } catch (error) {
                Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat generate tagihan.', 'error');
            } finally {
                setIsGenerating(false);
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Transaksi Pembayaran Iuran
                </Typography>
                
                <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleGenerateTagihan}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Memproses...' : 'Generate Tagihan Bulan Ini'}
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Form Input</Typography>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth required sx={{ minWidth: 200 }}>
                                            <InputLabel id="label-pilih-rumah">Pilih Rumah</InputLabel>
                                            <Select 
                                                labelId="label-pilih-rumah"
                                                value={formData.rumah_id} 
                                                label="Pilih Rumah" 
                                                onChange={handleRumahChange}
                                            >
                                                {listRumah.map((rumah) => {
                                                    const penghuni = rumah.riwayat_penghuni?.find(r => r.tanggal_keluar === null)?.penghuni;
                                                    return (
                                                        <MenuItem key={rumah.id} value={rumah.id}>
                                                            Blok {rumah.nomor_rumah} - {penghuni ? penghuni.nama_lengkap : 'Kosong'}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Jenis Iuran</InputLabel>
                                            <Select value={formData.jenis_iuran} label="Jenis Iuran" onChange={(e) => setFormData({ ...formData, jenis_iuran: e.target.value, bayar_setahun: false })}>
                                                <MenuItem value="kebersihan">Kebersihan</MenuItem>
                                                <MenuItem value="satpam">Satpam</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Tahun</InputLabel>
                                            <Select value={formData.tahun} label="Tahun" onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}>
                                                {[2025, 2026, 2027].map(thn => <MenuItem key={thn} value={thn}>{thn}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {formData.jenis_iuran === 'kebersihan' && (
                                        <Grid item xs={12}>
                                            <FormControlLabel 
                                                control={<Checkbox checked={formData.bayar_setahun} onChange={(e) => setFormData({ ...formData, bayar_setahun: e.target.checked })} />} 
                                                label="Bayar Penuh 1 Tahun Lunas" 
                                            />
                                        </Grid>
                                    )}

                                    {!formData.bayar_setahun && (
                                        <Grid item xs={12}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Bulan</InputLabel>
                                                <Select value={formData.bulan} label="Bulan" onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}>
                                                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((bln, idx) => (
                                                        <MenuItem key={idx + 1} value={idx + 1}>{bln}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    )}

                                    <Grid item xs={12} sx={{ mt: 1 }}>
                                        <Button type="submit" variant="contained" color="success" fullWidth disabled={loading || !formData.rumah_id}>
                                            {loading ? 'Memproses...' : 'Simpan Pembayaran'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Riwayat Iuran {formData.rumah_id ? '(Rumah Terpilih)' : ''}
                            </Typography>
                            
                            {!formData.rumah_id ? (
                                <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
                                    Silakan pilih rumah di form untuk melihat riwayat.
                                </Typography>
                            ) : loadingHistory ? (
                                <Typography align="center" sx={{ mt: 5 }}>Memuat history...</Typography>
                            ) : (
                                <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Periode</TableCell>
                                                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Jenis</TableCell>
                                                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Nominal</TableCell>
                                                <TableCell sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historyData.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>Belum ada transaksi</TableCell></TableRow>
                                            ) : (
                                                historyData.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell>{item.bulan} / {item.tahun}</TableCell>
                                                        <TableCell sx={{ textTransform: 'capitalize' }}>{item.jenis_iuran}</TableCell>
                                                        <TableCell>Rp {item.jumlah_bayar.toLocaleString('id-ID')}</TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={item.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum'} 
                                                                color={item.status_pembayaran === 'lunas' ? 'success' : 'error'}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TransaksiIuran;