import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PGPPage from './pages/PGPPage'
import WirePolicyPage from './pages/WirePolicyPage'



function Private({ children }) {
    const { token } = useAuth()
    return token ? children : <Navigate to="/login" replace />
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<Private><DashboardPage /></Private>} />
                    <Route path="/wire-policy" element={<Private><WirePolicyPage /></Private>} />
                    <Route path="/pgp" element={<Private><PGPPage /></Private>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}