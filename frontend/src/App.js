import React, { useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Logout from './util/Logout';
import Home from './components/Home';
import Header from './components/Header';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
    const toast = useRef(null);

    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity, summary, detail, life: 3000, position: 'top-right' });
    };

    return (
        <Router>
            <div>
                <Toast ref={toast} />
                <Header />
                <Routes>
                    <Route path="/" element={<Home showToast={showToast} />} />
                    <Route path="/login" element={<LoginForm showToast={showToast} />} />
                    <Route path="/register" element={<RegisterForm showToast={showToast} />} />
                    <Route path="/logout" element={<Logout />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
