import { Container, Row, Col} from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import MainNavbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
    return (
        <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Topbar */}
            <MainNavbar />

            {/* Sidebar + Content */}
            <Container fluid>
                <Row>
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content */}
                    <Col md={{ span: 10, offset: 2 }} className="pt-4">
                        <Container>
                            <Outlet />
                        </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminLayout;
