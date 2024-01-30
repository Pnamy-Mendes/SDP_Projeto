import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext'; 
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';

import './../styles/LoginForm.css'; // Import the same CSS as the login page
import isAuthenticated from '../util/isAuthenticated';
import GitHubLogo from '../media/GitHub_Logo_White.png';
import GitHubMark from '../media/github-mark-white.png';

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errorField, setErrorField] = useState('');
    const [isOAuthLogin, setIsOAuthLogin] = useState(false);
    const [name, setName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:6969/api/register', { username, email, password }, { withCredentials: true });
            navigate('/');
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message);
                setErrorField(error.response.data.errorField);
            }
        }
    };

    const handleGitHubLogin = () => {
        // Redirect to your backend OAuth route
        setIsOAuthLogin(true);
        window.location.href = 'http://localhost:6969/auth/github';
    };

    return (
        <div className="login-page"> {/* Use the same login-page class for styling */}
            <div className="form-container">
                <form onSubmit={handleSubmit} className="login-form"> {/* Use the same login-form class for styling */}
                    <div className="field" style={{ marginBottom: '1rem' }}>
                        <span className="p-float-label">
                            <InputText
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className={errorField === 'username' ? 'p-invalid login' : 'login'}
                            />
                            <label htmlFor="username">Username</label>
                        </span>
                    </div>
                    <div className="field" style={{ marginBottom: '1rem' }}>
                        <span className="p-float-label">
                            <InputText
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                className={errorField === 'name' ? 'p-invalid login' : 'login'}
                            />
                            <label htmlFor="name">Name</label>
                        </span>
                    </div>
                    <div className="field" style={{ marginBottom: '1rem' }}>
                        <span className="p-float-label">
                            <InputText
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className={errorField === 'email' ? 'p-invalid login' : 'login'}
                            />
                            <label htmlFor="email">Email</label>
                        </span>
                    </div>
                    <div className="field" style={{ marginBottom: '1rem' }}>
                        <span className="p-float-label">
                            <InputText
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className={'login'}
                            />
                            <label htmlFor="password">Password</label>
                        </span>
                    </div>
                    {error && (
                        <div className="p-message p-message-error">
                            <span className="p-message-text">{error}</span>
                        </div>
                    )}
                    <Button type="submit" label="Register" className="p-button p-button-primary p-button-raised p-mt-2 p-center" />
                    <Button onClick={handleGitHubLogin} className="github-login-btn">
                        <img src={GitHubMark} alt="GitHub" className="github-logo" />
                        <img src={GitHubLogo} alt="GitHub" className="github-name-logo" />
                        Continue with GitHub
                    </Button>
                    <div className="register-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;
