import { Navigate, Route, Routes } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
import Users from '../pages/Users';
import Profiles from '../pages/Profiles';
import Documents from '../pages/Documents';
import Login from '../pages/Login';
import { AdminDashboardProvider } from '../context/AdminDashboardState';
import UserDetail from '../pages/UserDetail';
import { UserDashboardProvider } from '../context/UserDashboardState';
import UserDetailSidebar from '../components/UserDetailSidebar';

const ProtectedRoutes = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
        return <Navigate to={'/'} replace />;
    }

    if (user.user_type === '2') {
        // Admin routes
        return (
            <AdminDashboardProvider>
                <Routes>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<Home />} />
                        <Route path="users" element={<Users />} />
                        <Route path="profiles" element={<Profiles />} />
                        <Route path="documents" element={<Documents />} />
                        <Route path="/admin/:id" element={<UserDetailSidebar />} />
                    </Route>
                </Routes>
            </AdminDashboardProvider>
        );
    } else if (user.user_type === '1') {
        // Normal user routes
        return (
            <UserDashboardProvider>
                <Routes>
                    <Route path="/user" element={<UserLayout />}>
                        <Route path="dashboard" element={<UserDetail />} />
                    </Route>
                </Routes>
            </UserDashboardProvider>
        );
    } else {
        // Unknown role
        return (
            <Routes>
                <Route path="*" element={<Login />} />
            </Routes>
        );
    }
};

export default ProtectedRoutes;
