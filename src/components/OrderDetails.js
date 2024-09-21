// src/components/OrderDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderDetails.css';

function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/orders/${orderId}`)
      .then(response => setOrder(response.data))
      .catch(error => console.error('Error fetching order details:', error));
  }, [orderId]);

  return (
    <div className="order-details-container">
      {order ? (
        <div>
          <h1>Order Details for ID {order.id}</h1>
          <p>Amount: {order.amount}</p>
          <p>Discount: {order.discount}</p>
          <p>GST: {order.gst}</p>
          <p>Total Bill: {order.totalBill}</p>
          <p>Balance: {order.balance}</p>
          <button>Update Payment</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default OrderDetails;
