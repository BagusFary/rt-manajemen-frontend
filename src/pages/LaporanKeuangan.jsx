import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import {  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import api from '../services/api';

const LaporanKeuangan = () => {
    const [data, setData] = useState([]);
    const [tahun, setTahun] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/keuangan/report/summary-tahunan?tahun=${tahun}`);
            setData(response.data.data);
            console.log(response.data.data);
            console.log(Array.isArray(response.data.data));
        } catch (error) {
            console.error('Gagal mengambil data laporan:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tahun]);

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Laporan Keuangan {tahun}</Typography>
                
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Tahun</InputLabel>
                    <Select value={tahun} label="Tahun" onChange={(e) => setTahun(e.target.value)}>
                        {[2025, 2026, 2027].map(thn => <MenuItem key={thn} value={thn}>{thn}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>

            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 4 }}>Grafik Keuangan (Pemasukan vs Pengeluaran)</Typography>
                    
                    <Box sx={{ height: 400, width: '100%' }}>
                        {loading ? (
                            <Typography align="center">Memuat data...</Typography>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="bulan" />
                                    <YAxis tickFormatter={(val) => `${val >= 1000000 ? (val/1000000) + 'jt' : (val >= 1000 ? (val/1000) + 'rb' : val)}`} />
                                    <Tooltip formatter={(value) => formatRupiah(value)} />
                                    <Legend />
                                    <Bar dataKey="pemasukan" name="Pemasukan" fill="#4caf50" />
                                    <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f44336" />
                                    <Line type="monotone" dataKey="saldo" name="Saldo Akhir" stroke="#2196f3" strokeWidth={3} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LaporanKeuangan;