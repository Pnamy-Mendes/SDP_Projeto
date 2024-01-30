import React from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import isAuthenticated from '../util/isAuthenticated';

const Header = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        navigate('/logout');
    };

    return (
        <div>
            {isAuthenticated() && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1em' }}>
                    <Button variant="contained" color="error" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            )}   
        </div>
    );
};

export default Header;
