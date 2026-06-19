import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { MainLayout } from '@/layouts/MainLayout.jsx';
import HomePage from '@/pages/HomePage.jsx';
import Login from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import ActivityDetailPage from '@/pages/ActivityDetailPage.jsx';


const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* --- CÁC TRANG CÔNG KHAI (Ai cũng xem được) --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Trang chủ: Bỏ ProtectedRoute để public cho mọi người xem trước */}
                <Route path="/" element={
                    <MainLayout>
                        <HomePage />
                    </MainLayout>
                } />

                <Route path="/activities/:id" element={
                    <MainLayout>
                        <ActivityDetailPage />
                    </MainLayout>
                } />


            </Routes>
        </Router>
    );
}

export default App;