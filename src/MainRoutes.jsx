import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';;
import ProtectedRoutes from './helpers/ProtectedRoutes';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const MainRoutes = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = JSON.parse(localStorage.getItem('token'));
    return (
        <Routes>
            <Route
                path="/"
                element={
                    user && token ? (
                        user.user_type === '2' ? (
                            <Navigate to="/admin/dashboard" replace />
                        ) : (
                            <Navigate to="/user/dashboard" replace />
                        )
                    ) : (
                        <Login />
                    )
                }
            />
            <Route path="forgot-password" element={<ForgotPassword/>} />
            <Route path="reset-password/:username" element={<ResetPassword/>} />
            <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
    );
};

export default MainRoutes;
