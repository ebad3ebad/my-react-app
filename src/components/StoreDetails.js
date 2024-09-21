import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';

import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './StoreDetails.css'; // Import the CSS file
import HomeButton from './HomeButton';

const StoreDetails = () => {
  const location = useLocation();
  const { store_name } = location.state;
  const { storeId } = useParams();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [discount, setDiscount] = useState('');
  const [totalReceived, setTotalReceived] = useState('');
  let item;
let detail;
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          return;
        }

        // Fetching store orders from the API
        const response = await axios.get(`http://localhost:3000/api/order/store/${storeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
      } catch (error) {
        setError('Error fetching orders.');
        console.error(error);
      }
    };

    fetchOrders();
  }, [storeId]);

  // Function to open the modal when "Generate Bill" is clicked
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };



///// receipt generation
const downloadReceipt = (items, details) => {
  // Create a hidden container to generate the receipt
  const hiddenDiv = document.createElement('div');
  hiddenDiv.style.position = 'absolute';
  hiddenDiv.style.left = '0';
  hiddenDiv.style.top = '0';
  hiddenDiv.style.width = 'auto'; // Ensure the width of the hidden container spans the page
  hiddenDiv.style.display = 'flex';
  hiddenDiv.style.justifyContent = 'center'; // Center the receipt horizontally
  hiddenDiv.style.padding = '20px';
  hiddenDiv.style.fontFamily = 'Arial, sans-serif'; // Use standard font for uniformity
  document.body.appendChild(hiddenDiv);
  let dt=new Date()
  // Fill the hiddenDiv with receipt content
  hiddenDiv.innerHTML = `
    <div id="content-for-pdf" style="padding: 20px; max-width: 600px; border: 1px solid black;">
      <h4 style="text-align: center; margin-bottom: 10px;">RECEIPT</h4>
      <p style="text-align: left; font-size: 12px; margin-bottom: 5px;"><b>Sultani Traders</b><br/>Pakistan, Karachi<br />03312345678</p>
      <p style="text-align: left; font-size: 10px;"><strong>ORDER ID:</strong> #${details.order_id}<br />
        <strong>CURRENT DATE:</strong> ${dt.toLocaleDateString()}<br />
        <strong>ORDER DATE:</strong> ${details.order_date.slice(0,-14)}</p>
      <p style="text-align: left; font-size: 10px;"><strong>BILL TO:</strong><br />
        ${details.store_name}<br />
        ${details.store_person}<br />
  
      <div id="table-content">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px;">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 5px;">PRODUCT NAME</th>
              <th style="border: 1px solid black; padding: 5px;">QUANTITY</th>
              <th style="border: 1px solid black; padding: 5px;">UNIT</th>
              <th style="border: 1px solid black; padding: 5px;">PRICE</th>
              <th style="border: 1px solid black; padding: 5px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="border: 1px solid black; padding: 2px; ">${item.product_name}</td>
                <td style="border: 1px solid black; padding: 5px;">${item.qty}</td>
                <td style="border: 1px solid black; padding: 5px;">${item.unit}</td>
                <td style="border: 1px solid black; padding: 5px;">${item.sell_price}</td>
                <td style="border: 1px solid black; padding: 5px;">${item.Amount}</td>

                </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <table style="width: 100%; margin-bottom: 1px; font-size: 10px;">
        <tbody>
          <tr><td style="padding: 1px; "><strong>BILL</strong></td><td style="padding: 1px; text-align: right;">${details.bill}</td></tr>        
          <tr><td style="padding: 1px;"><strong>SALES TAX (GST) % </strong></td><td style="padding: 1px; text-align: right;">${details.gst_rate}</td></tr>
          <tr><td style="padding: 1px;"><strong>DISCOUNT</strong></td><td style="padding: 1px; text-align: right;">${details.discount}</td></tr>
           <tr><td style="padding: 1px;"><strong>TOTAL BILL</strong></td><td style="padding: 1px; text-align: right;">${details.total_bill}</td></tr>
          <tr><td style="padding: 1px;"><strong>TOTAL RECEIVED</strong></td><td style="padding: 1px; text-align: right;">${details.total_received}</td></tr>
          <tr><td style="padding: 1px;"><strong>TOTAL BALANCE</strong></td><td style="padding: 1px; text-align: right;">${details.balance}</td></tr>
        </tbody>
      </table>
      <p style="text-align: center; font-size: 8px;">
        This is a computer-generated receipt and doesn't require a signature.<br />
        If you have any questions concerning this invoice, contact: Sultani Traders.
      </p>
    </div>
  `;

  // Render the HTML content to a canvas
  html2canvas(hiddenDiv, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    let pdfHeight = (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width;

    // Add the image to the first page
    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdfHeight);

    // Check if the content overflows and requires a new page
    let yPosition = pdfHeight;
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (yPosition >= pageHeight) {
      pdf.addPage();
      yPosition = 0; // Reset position for the new page
      // You can repeat the addImage for subsequent pages or handle additional content similarly
    }

    pdf.save(`receipt_${details.order_id}.pdf`);
    document.body.removeChild(hiddenDiv); // Clean up: remove the temporary hidden div
  }).catch(error => {
    console.error('Error generating receipt PDF:', error);
  });
};




////
  // Function to handle modal form submission (you can add the necessary logic here)
  const handleSubmitReceipt = async () => {
    const order_id = selectedOrder.order_id; // Correctly using order_id from the selected order
    const discount = parseFloat(selectedOrder.discount || 0); // Ensuring discount is a number
    const total_received = parseFloat(totalReceived || 0); // Ensuring total_received is a number
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login again.');
        return;
      }
  
      // Sending POST request to the API with discount and total_received in the body
      const response = await axios.post(
        `http://localhost:3000/api/order/revenue/${order_id}`, 
        {
          discount, // Sending discount
          total_received // Sending total_received
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      //console.log('Response:', response.data); // Handle the response as needed


      
    } catch (error) {
      setError('Error posting revenue.');
      console.error(error);
    }


    try{
      const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          return;
        }
      const response = await axios.get(
        `http://localhost:3000/api/order/receipt_table/${order_id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
 item=response.data
console.log(item)
      //generatePDF(receiptData[0]);
    } catch(error){
      setError('Error generating receipt pdf')
      console.error(error)
    }


    try{
      const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          return;
        }
      const response = await axios.get(
        `http://localhost:3000/api/order/receipt_other/${order_id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
 detail=response.data[0]

      //generatePDF(receiptData[0]);
    } catch(error){
      setError('Error generating receipt pdf')
      console.error(error)
    }
    
    downloadReceipt(item,detail)
    setIsModalOpen(false);
   // window.location.reload();
  };

  return (
    <div className="store-details">
      <HomeButton />
      <h2>Store Orders for {store_name}</h2>
      {error && <p className="error">{error}</p>}

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Order Date</th>
            <th>Bill</th>
            <th>GST Rate</th>
            <th>Balance</th>
            <th>Total Bill</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>{new Date(order.order_date).toLocaleDateString()}</td>
              <td>{order.bill}</td>
              <td>{order.gst_rate}</td>
              <td>{order.balance}</td>
              <td>{order.total_bill}</td>
              <td>
                <button onClick={() => openModal(order)}>Generate Bill</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Generate Bill for Order {selectedOrder.order_id}</h3>
            <p><b>Total Bill:</b> {selectedOrder.total_bill}</p>
            <p><b>Balance: </b>{selectedOrder.balance}</p>

            <label>Discount:</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />

            <label>Total Received:</label>
            <input
              type="number"
              value={totalReceived}
              onChange={(e) => setTotalReceived(e.target.value)}
            />

            <button onClick={handleSubmitReceipt}>Receipt</button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetails;
