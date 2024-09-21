// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Importing CSS

function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3000/api/order/dashboard')
      .then(response => setStats(response.data[0]))
      .catch(error => console.error('Error fetching dashboard:', error));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Zahid Traders</h3>
        <ul>
          <li><Link to="/inventory">Inventory</Link></li>
          <li><Link to="/medical-stores">Medical Stores</Link></li>
        </ul>
      </div>
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <div className="stats">
          <div className="stat-box">
            <p>Total Completed Orders</p>
            <h3>{stats.completed_orders}</h3>
          </div>
          <div className="stat-box">
            <p>Total Medical Stores</p>
            <h3>{stats.active_stores}</h3>
          </div>
          <div className="stat-box">
            <p>Total Inventory</p>
            <h3>{stats.active_products}</h3>
          </div>
          <div className="stat-box">
            <p>Pending Orders</p>
            <h3>{stats.pending_orders}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
