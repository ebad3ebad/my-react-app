import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Inventory.css'; // Optional for styling
import { getToken } from './utils/auth'; // Assuming you have a token retrieval function
import HomeButton from './HomeButton';


function Inventory() {
  const [inventory, setInventory] = useState([]); // Inventory list
  const [showModal, setShowModal] = useState(false); // State to show/hide the modal
  const [newItem, setNewItem] = useState({
    product_name: '',
    qty: 0,
    unit: 'packet', // Default to packet
    purchase_price: 0,
    purchase_date: '' // Store purchase date
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Mode to determine if it's add or update
  const [itemIdToUpdate, setItemIdToUpdate] = useState(null); // Store item ID for updating
  const [error, setError] = useState(null); // Error state
  const [confirmationMessage, setConfirmationMessage] = useState(null); // Confirmation message state

  // Fetch the inventory data from the API
  const fetchInventory = async () => {
    const token = getToken();
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/inventory/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInventory(response.data);
    } catch (error) {
      setError('Error fetching inventory data');
    }
  };

  // Function to handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  // Function to handle adding or updating inventory
  const handleSubmitInventory = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    const token = getToken();
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }

    try {
      if (isUpdateMode) {
        // Update inventory item
        await axios.put(`http://localhost:3000/api/inventory/update/${itemIdToUpdate}`, newItem, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConfirmationMessage("Inventory item updated successfully!");
      } else {
        // Add new inventory item
        await axios.post('http://localhost:3000/api/inventory/create', newItem, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConfirmationMessage("New inventory item added successfully!");
      }

      setShowModal(false); // Close the modal after submission
      fetchInventory(); // Refresh the inventory list

      // Clear the confirmation message after 3 seconds
      setTimeout(() => {
        setConfirmationMessage(null);
      }, 3000);
    } catch (error) {
      setError('Error saving inventory item');
    }
  };

  // Function to handle updating an item (open the modal with prefilled values)
  const handleUpdateClick = (item) => {
    setIsUpdateMode(true);
    setItemIdToUpdate(item.product_id); // Store the ID of the item to update
    setNewItem({
      product_name: item.product_name,
      qty: item.qty,
      unit: item.unit,
      purchase_price: item.purchase_price,
      purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
    });
    setShowModal(true); // Open the modal
  };

  // Function to handle deleting an item
  const handleDeleteClick = async (itemId) => {
    console.log("no")
    const token = getToken();
    if (!token) {
      setError("No token found. Please login again.");
      console.log("no")
      return;
    }
    console.log(itemId)

    try {
      await axios.put(`http://localhost:3000/api/inventory/delete/${itemId}`,{}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConfirmationMessage("Inventory item deleted successfully!");
      fetchInventory(); // Refresh the inventory list

      // Clear the confirmation message after 3 seconds
      setTimeout(() => {
        setConfirmationMessage(null);
      }, 3000);
    } catch (error) {
      setError('Error deleting inventory item');
    }
  };

  // Fetch inventory when the component mounts
  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="inventory-container">
      <h1>Inventory Management</h1>
      <HomeButton />
      {error && <p className="error">{error}</p>}
      {confirmationMessage && <p className="confirmation">{confirmationMessage}</p>} {/* Confirmation message */}

      <button
        onClick={() => {
          setIsUpdateMode(false); // Ensure we're in add mode
          setNewItem({
            product_name: '',
            qty: 0,
            unit: 'packet',
            purchase_price: 0,
            purchase_date: ''
          });
          setShowModal(true); // Show modal for adding
        }}
        className="add-inventory-btn"
      >
        Add New Inventory
      </button>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Type</th>
            <th>Purchase Price</th>
            <th>Purchase Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <tr key={item.product_id}>
                <td>{item.product_name}</td>
                <td>{item.qty}</td>
                <td>{item.unit}</td>
                <td>${item.purchase_price.toFixed(2)}</td>
                <td>{new Date(item.purchase_date).toLocaleDateString()}</td>
                <td>
                  <button
                    className="update-btn"
                    onClick={() => handleUpdateClick(item)}
                  >
                    Update
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteClick(item.product_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No inventory data available.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal for adding or updating inventory */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isUpdateMode ? "Update Inventory" : "Add New Inventory"}</h2>
            <form onSubmit={handleSubmitInventory}>
              <div className="input-group">
                <label>Product Name:</label>
                <input
                  type="text"
                  name="product_name"
                  value={newItem.product_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  name="qty"
                  value={newItem.qty}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Unit:</label>
                <select name="unit" value={newItem.unit} onChange={handleInputChange}>
                  <option value="packet">Packet</option>
                  <option value="carton">Carton</option>
                </select>
              </div>
              <div className="input-group">
                <label>Purchase Price:</label>
                <input
                  type="number"
                  name="purchase_price"
                  value={newItem.purchase_price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Purchase Date:</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={newItem.purchase_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                {isUpdateMode ? "Update Inventory" : "Add Inventory"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
