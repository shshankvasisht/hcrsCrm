import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';;
import ProtectedRoutes from './helpers/ProtectedRoutes';

const MainRoutes = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return (
        <Routes>
            <Route
                path="/"
                element={
                    user ? (
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
            <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
    );
};

export default MainRoutes;
