import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [workflows, setWorkflows] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    useEffect(() => {
        // Fetch workflows
        const fetchWorkflows = async () => {
            try {
                const { data } = await axios.get('http://localhost:5005/api/workflows', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorkflows(data);
            } catch (e) {
                // If token is invalid (expired), clear it and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                navigate('/');
            }
        };
        fetchWorkflows();
    }, [token, navigate]);

    const handleLogout = () => {
        // 1. Clear Storage
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        // 2. Redirect to Login
        navigate('/');
    };

    const createNew = async () => {
        const name = prompt("Enter Workflow Name:");
        if (name) {
            try {
                const { data } = await axios.post('http://localhost:5005/api/workflows',
                    { name, nodes: [], edges: [] },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigate(`/editor/${data.id}`);
            } catch (e) { alert("Error creating workflow"); }
        }
    };

    const deleteWorkflow = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this workflow?")) {
            await axios.delete(`http://localhost:5005/api/workflows/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkflows(prev => prev.filter(w => w._id !== id));
        }
    };

    return (
        <div className="dashboard">
            <div className="dash-header">
                <h1>👋 Welcome, {username}</h1>
                <div className="dash-actions">
                    {/* LOGOUT BUTTON */}
                    <button className="btn sec" onClick={handleLogout}>Logout</button>
                    <button className="btn pri" onClick={createNew}>+ New Workflow</button>
                </div>
            </div>

            <div className="wf-grid">
                {workflows.length === 0 && <p style={{ color: '#888' }}>No workflows yet. Create one!</p>}
                {workflows.map(wf => (
                    <div key={wf._id} className="wf-card" onClick={() => navigate(`/editor/${wf._id}`)}>
                        <div className="wf-icon">⚡</div>
                        <div className="wf-info">
                            <h3>{wf.name}</h3>
                            <small>Created: {new Date(wf.createdAt).toLocaleDateString()}</small>
                        </div>
                        <button className="delete-btn" onClick={(e) => deleteWorkflow(wf._id, e)}>🗑️</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;