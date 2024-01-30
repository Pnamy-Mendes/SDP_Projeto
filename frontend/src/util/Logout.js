// src/components/Logout.js or src/utils/Logout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // Clear the authentication cookie
        Cookies.remove('authToken', { path: '/' });

        // Redirect to the login page or home page after logout
        navigate('/login'); // Adjust the redirection path as necessary

        // Optionally, update the application state as necessary
        // For example, update context or redux state to reflect the logout
    }, [navigate]);

    return null; // This component does not render anything
}

export default Logout;
