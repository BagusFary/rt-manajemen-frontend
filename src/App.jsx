import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import DataWarga from './pages/DataWarga';
import DataRumah from './pages/DataRumah';
import TransaksiIuran from './pages/TransaksiIuran';
import CatatPengeluaran from './pages/CatatPengeluaran';
import LaporanKeuangan from './pages/LaporanKeuangan';

export default function App() {
    return (
        <Router>
            <CssBaseline />
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/warga" element={<DataWarga />}/>
                        <Route path="/rumah" element={<DataRumah />}/>
                        <Route path="/iuran" element={<TransaksiIuran />}/>
                        <Route path="/pengeluaran" element={<CatatPengeluaran />}/>
                        <Route path="/keuangan" element={<LaporanKeuangan />}/>
                        
                    </Route>
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}