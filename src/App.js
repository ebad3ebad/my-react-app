// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import MedicalStores from './components/MedicalStores';
import StoreDetails from './components/StoreDetails';
import OrderDetails from './components/OrderDetails';
import Order from './components/order';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/medical-stores" element={<MedicalStores />} />
        <Route path="/store/:storeId" element={<StoreDetails />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/order/:storeId" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
