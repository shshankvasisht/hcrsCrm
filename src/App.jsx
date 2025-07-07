import './App.css';
import { BrowserRouter } from 'react-router-dom';
import MainRoutes from './MainRoutes';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function App() {
    function logoutUser() {
        localStorage.removeItem('token');
        window.location.href = '/'; // or navigate programmatically
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log(token, "123");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const now = Date.now() / 1000;

                if (decoded.exp < now) {
                    logoutUser();
                } else {
                    const remainingTime = (decoded.exp - now) * 1000;
                    const timer = setTimeout(() => {
                        logoutUser();
                    }, remainingTime);

                    return () => clearTimeout(timer);
                }
            } catch (e) {
                console.log(e);
                logoutUser();
            }
        }
    }, []);
    return (
        <>
            <BrowserRouter>
                <ToastContainer />
                <MainRoutes />
            </BrowserRouter>
        </>
    );
}

export default App;
