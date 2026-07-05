import { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, TablePagination, TextField, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, 
    InputLabel, Select, MenuItem, Chip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Swal from 'sweetalert2';
import api from '../services/api';

export default function DataRumah() {
    const [rumah, setRumah] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    const [openAssignModal, setOpenAssignModal] = useState(false);
    const [selectedRumah, setSelectedRumah] = useState(null);
    const [assignData, setAssignData] = useState({
        penghuni_id: '',
        tanggal_masuk: ''
    });
    const [listPenghuni, setListPenghuni] = useState([]);

    const [formData, setFormData] = useState({
        nomor_rumah: '',
        status_rumah: 'tidak_dihuni'
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchDataRumah = async () => {
        try {
            setLoading(true);
            const response = await api.get('/rumah', {
                params: {
                    page: page + 1,
                    per_page: rowsPerPage,
                    search: debouncedSearch
                }
            });
            console.log(response);
            const paginationData = response.data.data;
            setRumah(paginationData.data);
            setTotalRows(paginationData.total);
        } catch (error) {
            console.error('Gagal mengambil data rumah:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchListPenghuni = async () => {
        try {
            const response = await api.get('/penghuni', { params: { per_page: 100 } });
            setListPenghuni(response.data.data.data); 
        } catch (error) {
            console.error('Gagal mengambil list penghuni:', error);
        }
    };

    useEffect(() => {
        fetchDataRumah();
    }, [page, rowsPerPage, debouncedSearch]);

    useEffect(() => {
        fetchListPenghuni();
    }, []);

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditId(null);
        setFormData({ nomor_rumah: '', status_rumah: 'tidak_dihuni' });
    };

    const handleOpenEditModal = (row) => {
        setEditId(row.id);
        setFormData({
            nomor_rumah: row.nomor_rumah,
            status_rumah: row.status_rumah,
        });
        setOpenModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'status_rumah' && value !== 'dihuni') {
                newData.penghuni_id = '';
            }
            return newData;
        });
    };

    const handleOpenAssign = (row) => {
        setSelectedRumah(row);
        setAssignData({
            penghuni_id: '',
            tanggal_masuk: new Date().toISOString().split('T')[0] 
        });
        setOpenAssignModal(true);
    };

    const handleCloseAssign = () => {
        setOpenAssignModal(false);
        setSelectedRumah(null);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            await api.post(`/rumah/${selectedRumah.id}/assign`, assignData);
            
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Penghuni berhasil ditugaskan.', timer: 2000, showConfirmButton: false });
            handleCloseAssign();
            fetchDataRumah(); 
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Gagal menugaskan penghuni.' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        
        try {
            const payload = {
                ...formData,
                penghuni_id: formData.status_rumah === 'dihuni' ? formData.penghuni_id : null
            };

            if (editId) {
                await api.put(`/rumah/${editId}`, payload);
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data rumah diperbarui.', timer: 2000, showConfirmButton: false });
            } else {
                await api.post('/rumah', payload);
                Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data rumah ditambahkan.', timer: 2000, showConfirmButton: false });
            }
            
            handleCloseModal();
            fetchDataRumah();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: error.response?.data?.message || 'Terjadi kesalahan pada server.' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus data rumah ini?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/rumah/${id}`);
                    Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Data rumah dihapus.', timer: 2000, showConfirmButton: false });
                    fetchDataRumah();
                } catch (error) {
                    Swal.fire('Gagal', 'Tidak dapat menghapus data.', 'error');
                }
            }
        });
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Data Rumah</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Cari nomor rumah..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={() => setOpenModal(true)}
                    >
                        Tambah Rumah
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell width="5%">No</TableCell>
                                    <TableCell>Nomor Rumah</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Penghuni</TableCell>
                                    <TableCell align="center">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rumah?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            {searchTerm ? 'Data rumah tidak ditemukan.' : 'Belum ada data rumah.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rumah?.map((row, index) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{row.nomor_rumah}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.status_rumah.toUpperCase()} 
                                                    color={row.status_rumah === 'dihuni' ? 'success' : row.status_rumah === 'renovasi' ? 'warning' : 'default'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.riwayat_penghuni && row.riwayat_penghuni.length > 0 && row.riwayat_penghuni[0].penghuni
                                                    ? row.riwayat_penghuni[0].penghuni.nama_lengkap 
                                                    : '-'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {row.status_rumah === 'tidak_dihuni' && (
                                                    <Button 
                                                        size="small" 
                                                        color="success" 
                                                        variant="outlined"
                                                        sx={{ mr: 1 }} 
                                                        onClick={() => handleOpenAssign(row)}
                                                    >
                                                        Isi Penghuni
                                                    </Button>
                                                )}
                                                <Button size="small" color="primary" sx={{ mr: 1 }} onClick={() => handleOpenEditModal(row)}>Edit</Button>
                                                <Button size="small" color="error" onClick={() => handleDelete(row.id)}>Hapus</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </>
                )}

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Baris per halaman:"
                />
            </TableContainer>
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {editId ? 'Edit Data Rumah' : 'Tambah Data Rumah'}
                </DialogTitle>
                
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField 
                                label="Nomor Rumah (Contoh: Blok A No. 12)" 
                                name="nomor_rumah" 
                                value={formData.nomor_rumah} 
                                onChange={handleChange} 
                                required 
                            />
                            
                            <FormControl fullWidth required>
                                <InputLabel>Status Hunian</InputLabel>
                                <Select 
                                    name="status_rumah" 
                                    value={formData.status_rumah} 
                                    onChange={handleChange} 
                                    label="Status Hunian"
                                >
                                    <MenuItem value="tidak_dihuni">Tidak Dihuni</MenuItem>
                                    <MenuItem value="dihuni">Dihuni</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    
                    <DialogActions>
                        <Button onClick={handleCloseModal} color="inherit">Batal</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={submitLoading}>
                            {submitLoading ? 'Menyimpan...' : (editId ? 'Update Data' : 'Simpan Data')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog open={openAssignModal} onClose={handleCloseAssign} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Atur Penghuni - Rumah No. {selectedRumah?.nomor_rumah}
                </DialogTitle>
                <form onSubmit={handleAssignSubmit}>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Pilih Warga</InputLabel>
                                <Select
                                    value={assignData.penghuni_id}
                                    label="Pilih Warga"
                                    onChange={(e) => setAssignData({ ...assignData, penghuni_id: e.target.value })}
                                >
                                    {listPenghuni.length === 0 ? (
                                        <MenuItem value="" disabled>Data warga kosong</MenuItem>
                                    ) : (
                                        listPenghuni.map((p) => (
                                            <MenuItem key={p.id} value={p.id}>
                                                {p.nama_lengkap}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                label="Tanggal Masuk"
                                type="date"
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                value={assignData.tanggal_masuk}
                                onChange={(e) => setAssignData({ ...assignData, tanggal_masuk: e.target.value })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAssign} color="inherit">Batal</Button>
                        <Button type="submit" variant="contained" color="success" disabled={submitLoading}>
                            {submitLoading ? 'Menyimpan...' : 'Simpan Tugas'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}