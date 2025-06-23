import { Navbar, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MainNavbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const handleLogout  = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    }
    return (
        <Navbar bg="white" expand="lg" className="shadow-sm px-4 py-3 sticky-top">
            <Navbar.Brand className="fw-bold">
                <img src="/images/hcrs-logo-big.png"/>
            </Navbar.Brand>
            <div className="ms-auto d-flex align-items-center">
                <Dropdown align="end">
                    <Dropdown.Toggle variant="light" id="dropdown-basic" className="border-0">
                        Welcome <span className='text-capitalize'>{user ? user.username : ""}</span>
                        {/* <img src="https://via.placeholder.com/30" roundedCircle /> */}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {/* <Dropdown.Item>Profile</Dropdown.Item>
                        <Dropdown.Item>Settings</Dropdown.Item> */}
                        {/* <Dropdown.Divider /> */}
                        <Dropdown.Item onClick={() => handleLogout()}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </Navbar>
    );
};

export default MainNavbar;
