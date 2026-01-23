import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { if (toast) setTimeout(() => setToast(null), 3000) }, [toast]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!creds.username || !creds.password) {
            setToast({ msg: "Please fill in all fields", type: "error" });
            return;
        }
        if (creds.password.length < 4) {
            setToast({ msg: "Password must be at least 4 characters", type: "error" });
            return;
        }

        try {
            const res = await axios.post('http://localhost:5005/api/auth/signup', creds);
            setToast({ msg: res.data.message, type: "success" });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Signup Failed";
            setToast({ msg: errorMsg, type: "error" });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-logo">🚀</div>
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Choose Username"
                        value={creds.username}
                        onChange={e => setCreds({ ...creds, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Choose Password"
                        value={creds.password}
                        onChange={e => setCreds({ ...creds, password: e.target.value })}
                    />
                    <button type="submit" className="btn pri full-width">Sign Up</button>
                </form>
                <p>Already have an account? <Link to="/">Login</Link></p>
            </div>

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
                </div>
            )}
        </div>
    );
};

export default Signup;