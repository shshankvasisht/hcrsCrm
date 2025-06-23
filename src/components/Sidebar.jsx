import { NavLink } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaUserShield } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <Col md={2} className="sidebar bg-white border-end d-none d-md-block vh-100 position-fixed px-0">
      <nav className="nav flex-column py-4">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `nav-link sidebar-link px-4 py-3 ${isActive ? 'active' : ''}`}
        >
          <FaTachometerAlt className="me-2" /> Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) => `nav-link sidebar-link px-4 py-3 ${isActive ? 'active' : ''}`}
        >
          <FaUsers className="me-2" /> Users
        </NavLink>

        <NavLink
          to="/admin/documents"
          className={({ isActive }) => `nav-link sidebar-link px-4 py-3 ${isActive ? 'active' : ''}`}
        >
          <FaFileAlt className="me-2" /> Documents
        </NavLink>

        <NavLink
          to="/admin/profiles"
          className={({ isActive }) => `nav-link sidebar-link px-4 py-3 ${isActive ? 'active' : ''}`}
        >
          <FaUserShield className="me-2" /> Profiles
        </NavLink>
      </nav>
    </Col>
  );
};

export default Sidebar;
