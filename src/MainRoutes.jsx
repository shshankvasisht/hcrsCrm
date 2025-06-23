import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Users from './pages/Users';
import AdminLayout from './layouts/AdminLayout';
import Profiles from './pages/Profiles';
import Documents from './pages/Documents';
import UserLayout from './layouts/UserLayout';
import ProtectedRoutes from './helpers/ProtectedRoutes';

const MainRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
    );
};

export default MainRoutes;
