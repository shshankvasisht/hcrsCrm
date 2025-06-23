import { Container} from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import MainNavbar from '../components/Navbar';

const UserLayout = () => {
    return (
        <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Topbar */}
            <MainNavbar />

            {/* Sidebar + Content */}
            <Container>
                <Outlet />       
            </Container>
        </div>
    );
};

export default UserLayout;
