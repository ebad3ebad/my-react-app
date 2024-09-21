// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Optional styling

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // To display any error messages
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    const loginData = {
      username: username,
      password: password, // Assume the password is hashed already, if needed hash it before sending.
    };

    axios.post('http://localhost:3000/api/auth/login', loginData)
      .then(response => {
        const { token } = response.data;
        console.log(token);
        if (token) {
          
          localStorage.setItem('token', token);
        
          // Navigate to the dashboard after successful login
          navigate('/dashboard');
        } else {
          setError('Login failed, no token received.');
        }
      })
      .catch(err => {
        setError('Login failed. Please check your credentials.');
        console.error('Error during login:', err);
      });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Zahid Traders</h1>
        <h2>Login to Your Account</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username:</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
