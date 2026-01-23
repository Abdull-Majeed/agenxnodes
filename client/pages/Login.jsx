import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [toast, setToast] = useState(null); // Local Toast State
    const navigate = useNavigate();

    // Auto-hide toast
    useEffect(() => { if (toast) setTimeout(() => setToast(null), 3000) }, [toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Client Validation
        if (!creds.username || !creds.password) {
            setToast({ msg: "Please fill in all fields", type: "error" });
            return;
        }

        try {
            const { data } = await axios.post('http://localhost:5005/api/auth/login', creds);

            // Success
            setToast({ msg: "Login Successful! Redirecting...", type: "success" });
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);

            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (err) {
            // Specific Error Handling
            const errorMsg = err.response?.data?.error || "Login Failed. Check console.";
            setToast({ msg: errorMsg, type: "error" });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-logo">⚡</div>
                <h2>Login to AgenxNodes</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={creds.username}
                        onChange={e => setCreds({ ...creds, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={creds.password}
                        onChange={e => setCreds({ ...creds, password: e.target.value })}
                    />
                    <button type="submit" className="btn pri full-width">Login</button>
                </form>
                <p>New here? <Link to="/signup">Create an account</Link></p>
            </div>

            {/* Local Toast Component */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
                </div>
            )}
        </div>
    );
};

export default Login;