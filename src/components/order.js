import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Order.css'; // Import your CSS styles
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const navigate = useNavigate();
  const [productList, setProductList] = useState([{ product_name: '',product_id:'', qty: '', unit: '', sell_price: '' }]);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const { storeId } = useParams();
  const handleProductChange = async (index, field, value) => {
    const updatedProducts = [...productList];
    updatedProducts[index][field] = value;
    setProductList(updatedProducts);

    // Fetch suggestions for the product name (only when the field is 'product_name' and the input is 3 or more characters)
    if (field === 'product_name' && value.length >= 3) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          return;
        }

        // API call to fetch product suggestions
        const response = await axios.get(`http://localhost:3000/api/order/suggestion?query=${value}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const suggestions = response.data;
        setProductSuggestions(suggestions); // Update the state with the suggestions
      } catch (error) {
        console.error('Error fetching product suggestions:', error);
        setError('Error fetching product suggestions');
      }
    }
  };

  const handleUnitChange = (index, value) => {
    // Only allow 'packet' or 'carton' for the unit field
    const allowedUnits = ['packet', 'carton'];
    if (allowedUnits.includes(value.toLowerCase())) {
      const updatedProducts = [...productList];
      updatedProducts[index].unit = value;
      setProductList(updatedProducts);
    } else {
      setError('Unit must be either "packet" or "carton"');
    }
  };

  const handleAddMoreProduct = () => {
    setProductList([...productList, { product_name: '', qty: '', unit: '', sell_price: '' }]);
  };

  const handleSuggestionClick = (index, product) => {
    const updatedProducts = [...productList];
    updatedProducts[index].product_name = product.product_name;
    updatedProducts[index].product_id = product.product_id;
    updatedProducts[index].qty = product.qty;
    updatedProducts[index].unit = product.unit;
    updatedProducts[index].sell_price = product.sell_price;
    setProductList(updatedProducts);
    setProductSuggestions([]); // Clear suggestions after selection
  };

  const handleSubmitOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login again.');
      return;
    }
    if (window.confirm('Are you sure you want to submit this order ?')) {
    try {
      const orderData = productList.map((product) => ({
        product_id: product.product_id, // Send product_id instead of product_name
        qty: product.qty,
        unit: product.unit,
        sell_price: product.sell_price,
      }));
      console.log(storeId,orderData)
      await axios.post('http://localhost:3000/api/order/create', {
        store_id: storeId,
        products: orderData
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setConfirmationMessage('Order placed successfully!');
      setTimeout(() => navigate('/medical-stores'), 1000);
    } catch (error) {
      setError('Error placing the order');
      console.log(error)
    }
  }};

  return (
    <div className="order-page">
      <h2>Create Order for Store</h2>
      {productList.map((product, index) => (
        <div key={index} className="product-input-group">
          <label>Product Name:</label>
          <input
            type="text"
            value={product.product_name}
            onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
          />
          {/* Show product suggestions if available */}
          {productSuggestions.length > 0 && (
            <ul className="suggestions-list">
              {productSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(index, suggestion)}
                  className="suggestion-item"
                >
                  {suggestion.product_name} - {suggestion.qty} {suggestion.unit}
                </li>
              ))}
            </ul>
          )}

          <label>Quantity:</label>
          <input
            type="number"
            value={product.qty}
            onChange={(e) => handleProductChange(index, 'qty', e.target.value)}
          />

          <label>Unit (packet/carton):</label>
          <input
            type="text"
            value={product.unit}
            onChange={(e) => handleUnitChange(index, e.target.value)}
          />

          <label>Sell Price:</label>
          <input
            type="number"
            value={product.sell_price}
            onChange={(e) => handleProductChange(index, 'sell_price', e.target.value)}
          />
        </div>
      ))}

      <button className="add-more-btn" onClick={handleAddMoreProduct}>Add More Products</button>
      <button className="submit-btn" onClick={handleSubmitOrder}>Submit Order</button>
      <button className="cancel-btn" onClick={() => navigate('/medical-stores')}>Cancel</button>
     


      {error && <div className="error">{error}</div>}
      {confirmationMessage && <div className="confirmation">{confirmationMessage}</div>}
    </div>
  );
};

export default OrderPage;
