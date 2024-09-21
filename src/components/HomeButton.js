import React from 'react';

const HomeButton = () => {
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
      onClick={() => window.location.href = 'http://localhost:3001/dashboard'}
    >
      Home
    </button>
  );
};

export default HomeButton;
