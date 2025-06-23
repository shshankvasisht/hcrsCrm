import { Container, Row, Col, Nav, Navbar, Image, Dropdown } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';
import MainNavbar from '../components/Navbar';
import NotificationTable from '../components/NotificationTable';

const Home = () => {
    return (
       <div className="container py-4">
            <NotificationTable />
       </div>
    );
}

export default Home;