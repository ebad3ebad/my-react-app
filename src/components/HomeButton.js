import React from 'react';
import { useNavigate } from 'react-router-dom';


const HomeButton = () => {
  const navigate = useNavigate();
  return (
    <button 
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        position: 'absolute',
        top: '5px',
        left: '50px'
      }}
      onClick={() => navigate('/dashboard')}
    >
      Home
    </button>
  );
};

export default HomeButton;
