import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import api from '../services/api';

export default function DataWarga() {
    const [warga, setWarga] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        status_penghuni: 'tetap', 
        nomor_telepon: '',
        status_pernikahan: 'belum_menikah',
        foto_ktp: null 
    });

    const fetchDataWarga = async () => {
        try {
            setLoading(true);
            const response = await api.get('/penghuni');
            setWarga(response.data.data || response.data);
        } catch (error) {
            console.error('Gagal mengambil data warga:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataWarga();
    }, []);

    const handleOpenModal = () => setOpenModal(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const maxSize = 2 * 1024 * 1024; 
            
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'warning',
                    title: 'File Terlalu Besar',
                    text: 'Ukuran maksimal foto KTP adalah 2MB.',
                });
                
                e.target.value = null; 
                return;
            }

            setFormData({
                ...formData,
                foto_ktp: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const submitData = new FormData();
        submitData.append('nama_lengkap', formData.nama_lengkap);
        submitData.append('status_penghuni', formData.status_penghuni);
        submitData.append('nomor_telepon', formData.nomor_telepon);
        submitData.append('status_pernikahan', formData.status_pernikahan);
        
        if (formData.foto_ktp) {
            submitData.append('foto_ktp', formData.foto_ktp);
        }

        try {
            if (editId) {
                submitData.append('_method', 'PUT'); 
                await api.post(`/penghuni/${editId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data warga berhasil diperbarui.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await api.post('/penghuni', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data warga berhasil ditambahkan.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            handleCloseModal();
            fetchDataWarga(); 
        } catch (error) {
            console.error('Gagal menyimpan data:', error);
            
            let errorMessage = 'Terjadi kesalahan pada server.';
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                errorMessage = errors[firstErrorKey][0];
            } 
            else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan',
                text: errorMessage,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleOpenEditModal = (warga) => {
        setEditId(warga.id);
        setFormData({
            nama_lengkap: warga.nama_lengkap,
            status_penghuni: warga.status_penghuni,
            nomor_telepon: warga.nomor_telepon,
            status_pernikahan: warga.status_pernikahan,
            foto_ktp: null
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditId(null);
        setFormData({
            nama_lengkap: '',
            status_penghuni: 'tetap',
            nomor_telepon: '',
            status_pernikahan: 'belum_menikah',
            foto_ktp: null
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data warga yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/penghuni/${id}`);
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: 'Data warga berhasil dihapus.',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    fetchDataWarga();
                } catch (error) {
                    console.error('Gagal menghapus data:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal Menghapus',
                        text: error.response?.data?.message || 'Terjadi kesalahan pada server.',
                    });
                }
            }
        });
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Data Warga (Penghuni)
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal} 
                >
                    Tambah Warga
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                            <TableRow>
                                <TableCell><b>No</b></TableCell>
                                <TableCell><b>Nama Lengkap</b></TableCell>
                                <TableCell><b>Status Penghuni</b></TableCell>
                                <TableCell><b>No. Telepon</b></TableCell>
                                <TableCell><b>Status Pernikahan</b></TableCell>
                                <TableCell align="center"><b>Aksi</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {warga.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        Belum ada data warga.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                warga.map((row, index) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{row.nama_lengkap}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status_penghuni} 
                                                color={row.status_penghuni === 'Kontrak' ? 'warning' : 'success'} 
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>{row.nomor_telepon}</TableCell>
                                        <TableCell>{row.status_pernikahan}</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                size="small" 
                                                color="primary" 
                                                sx={{ mr: 1 }}
                                                onClick={() => handleOpenEditModal(row)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDelete(row.id)}
                                            >
                                                Hapus
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editId ? 'Edit Data Warga' : 'Tambah Data Warga'}
                </DialogTitle>
                
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="nama_lengkap"
                                    label="Nama Lengkap"
                                    fullWidth
                                    required
                                    value={formData.nama_lengkap}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    name="status_penghuni"
                                    label="Status Penghuni"
                                    fullWidth
                                    required
                                    value={formData.status_penghuni}
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="tetap">Tetap</MenuItem>
                                    <MenuItem value="kontrak">Kontrak</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    name="status_pernikahan"
                                    label="Status Pernikahan"
                                    fullWidth
                                    required
                                    value={formData.status_pernikahan}
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="belum_menikah">Belum Menikah</MenuItem>
                                    <MenuItem value="menikah">Menikah</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="nomor_telepon"
                                    label="Nomor Telepon (WhatsApp)"
                                    fullWidth
                                    required
                                    value={formData.nomor_telepon}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: 081234567890"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ mt: 1, textTransform: 'none' }}
                                >
                                    {formData.foto_ktp ? 'Ubah Foto KTP' : 'Upload Foto KTP (Wajib)'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/jpeg, image/png, image/jpg"
                                        onChange={handleFileChange}
                                        required={!editId && !formData.foto_ktp}
                                    />
                                </Button>
                                {formData.foto_ktp && (
                                    <Typography variant="caption" display="block" mt={1} color="success.main">
                                        File terpilih: {formData.foto_ktp.name}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseModal} color="inherit" disabled={submitLoading}>
                            Batal
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={submitLoading}>
                            {submitLoading ? 'Menyimpan...' : (editId ? 'Update Data' : 'Simpan Data')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}