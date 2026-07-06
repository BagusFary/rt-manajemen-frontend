import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import api from '../../services/api';

const DetailTransaksiModal = ({ open, onClose, bulan, tahun, bulanIndex }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchDetail();
        }
    }, [open, bulanIndex, tahun]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/keuangan/report/detail-bulanan`, { 
                params: { bulan: bulanIndex, tahun } 
            });
        
            setData(response.data.data); 
        } catch (error) {
            console.error("Gagal ambil detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Detail Transaksi {bulan} {tahun}</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Typography>Memuat data...</Typography>
                ) : data ? (
                    <>
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>Ringkasan</Typography>
                            <Typography>Total Pemasukan: <b>{formatRupiah(data.ringkasan.total_pemasukan)}</b></Typography>
                            <Typography>Total Pengeluaran: <b>{formatRupiah(data.ringkasan.total_pengeluaran)}</b></Typography>
                            <Typography variant="h6" sx={{ mt: 1, color: data.ringkasan.saldo_akhir >= 0 ? 'green' : 'red' }}>
                                Saldo Akhir: {formatRupiah(data.ringkasan.saldo_akhir)}
                            </Typography>
                        </Box>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Pemasukan</Typography>
                        <TableContainer component={Paper} sx={{ mb: 3 }} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#fafafa' }}>
                                    <TableRow>
                                        <TableCell>Tanggal</TableCell>
                                        <TableCell>Jenis</TableCell>
                                        <TableCell align="right">Jumlah</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.detail_pemasukan.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                {row.tanggal_bayar ? row.tanggal_bayar.split(' ')[0] : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>{row.jenis_iuran}</TableCell>
                                            <TableCell align="right">{formatRupiah(row.jumlah_bayar)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Pengeluaran</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#fafafa' }}>
                                    <TableRow>
                                        <TableCell>Tanggal</TableCell>
                                        <TableCell>Deskripsi</TableCell>
                                        <TableCell align="right">Jumlah</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.detail_pengeluaran.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                {row.tanggal_pengeluaran ? row.tanggal_pengeluaran.split(' ')[0] : '-'}
                                            </TableCell>
                                            <TableCell>{row.deskripsi}</TableCell>
                                            <TableCell align="right">{formatRupiah(row.jumlah)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                ) : (
                    <Typography>Data tidak ditemukan.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="inherit">Tutup</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DetailTransaksiModal;