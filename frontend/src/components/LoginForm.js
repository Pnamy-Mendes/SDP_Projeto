import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext'; 
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import Cookies from 'js-cookie';

import './../styles/LoginForm.css';
import isAuthenticated from '../util/isAuthenticated';
import GitHubLogo from '../media/GitHub_Logo_White.png';
import GitHubMark from '../media/github-mark-white.png';


function LoginForm({ showToast }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isOAuthLogin, setIsOAuthLogin] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }

        // Check if the user clicked on github Login so it ifnores the error handling
        if (!isOAuthLogin) {
            const errorParam = searchParams.get('error');
            if (errorParam) {
                showToast('error', 'Error', decodeURIComponent(errorParam));
            }
        }    
    }, [navigate, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        // Check if username and/or password are missing
        if (!isOAuthLogin) {
            console.log('Not OAuth login');
            if (!username || !password) {
                const missingFields = [];
                /* if (!username) missingFields.push('username'); */
                if (!password) missingFields.push('password');
                const errorMessage = `Please enter your ${missingFields.join(' and ')}`;
                showToast('warn', 'Warning', errorMessage);
                setError(errorMessage);
                return;
            }
        }
        try {
            const response = await axios.post('http://localhost:6969/api/login', { username, password }, { withCredentials: true });
            if (response.data.message) { // Check if the response has a message 
                const token = {
                    id: response.data.id,
                    username: response.data.username,
                } 
                Cookies.set('authToken', token, { expires: 1, path: '/' });
                response.status===200 ? 
                    showToast('success', 'Success', response.data.message)
                :
                    showToast('error', 'Error', response.data.message)
                ; //
                navigate('/');
            } 
                
            navigate('/');
        } catch (error) {
            if (error.response) {
                showToast('error', 'Error', error.response.data.message);
                setError(error.response.data.message);
            }
        }
    };

    const handleGitHubLogin = () => {
        // Redirect to your backend OAuth route
        setIsOAuthLogin(true);
        window.location.href = 'http://localhost:6969/api/auth/github';
        // Bypass the error handling here if needed
    };

    return (
        <div className="login-page">
            <div className="form-container">
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="field" style={{ marginBottom: '1rem' }}> {/* Adjust this value as needed */}
                        <span className="p-float-label">
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={error ? 'p-invalid login' : 'login'}
                            />
                            <label htmlFor="username">Username</label>
                        </span>
                    </div>
                    <div className="field" style={{ marginBottom: '1rem' }}> {/* Adjust this value as needed */}
                        <span className="p-float-label">
                            <InputText
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={error ? 'p-invalid login' : 'login'}
                            />
                            <label htmlFor="password">Password</label>
                        </span>
                    </div>
                    {error && (
                        <Message severity="error" text={error} />
                    )}
                    <Button type="submit" label="Login" />
                    <Button onClick={handleGitHubLogin} className="github-login-btn">
                        <img src={GitHubMark} alt="GitHub" className="github-logo" />
                        <img src={GitHubLogo} alt="GitHub" className="github-name-logo" />
                        Continue with GitHub
                    </Button>
                    <div className="register-link">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
