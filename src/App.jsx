import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <Router>
            <CssBaseline />
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}