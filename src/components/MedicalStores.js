import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // React Router for navigation
import './MedicalStores.css';
import { getToken } from './utils/auth';
import HomeButton from './HomeButton';

const MedicalStore = () => {
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({ store_name: '', store_address: '', store_person: '', store_person_contact: '' });
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [storeIdToUpdate, setStoreIdToUpdate] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const token = getToken();
    if (!token) {
      setError("No token found. Please login again.");
      return;
    }
    try {
      const response = await axios.get('http://localhost:3000/api/medical-store/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching medical stores:', error);
    }
  };

  const handleAddStoreClick = () => {
    setShowModal(true);
    setIsUpdateMode(false);
    setNewStore({ store_name: '', store_address: '', store_person: '', store_person_contact: '' });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login again.');
      return;
    }

    try {
      if (isUpdateMode && storeIdToUpdate !== null) {
        await axios.put(`http://localhost:3000/api/medical-store/update/${storeIdToUpdate}`, newStore, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post('http://localhost:3000/api/medical-store/create', newStore, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setShowModal(false);
      fetchStores();
    } catch (error) {
      console.error('Error submitting store data:', error);
    }
  };

  const handleUpdateClick = (store) => {
    setIsUpdateMode(true);
    setStoreIdToUpdate(store.store_id);
    setNewStore({ store_name: store.store_name, store_address: store.store_address, store_person: store.store_person, store_person_contact: store.store_person_contact });
    setShowModal(true);
  };

  const handleDeleteClick = async (storeId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please login again.');
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/medical-store/delete/${storeId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const handleOrderClick = (storeId) => {
    navigate(`/order/${storeId}`); // Navigate to the order page with the store ID
  };
  const handleDetailClick = (storeId,store_name) => {
    navigate(`/store/${storeId}`,{ state: { store_name } }); // Navigate to the order page with the store ID
  };

  return (
    <div className="medical-store-container">
      <HomeButton />
      <h1>Medical Stores</h1>
      <button className="add-store-btn" onClick={handleAddStoreClick}>Add Medical Store</button>
      <table className="medical-store-table">
        <thead>
          <tr>
            <th>Store Name</th>
            <th>Address</th>
            <th>Contact Person</th>
            <th>Contact Person Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.store_id}>
              <td>{store.store_name}</td>
              <td>{store.store_address}</td>
              <td>{store.store_person}</td>
              <td>{store.store_person_contact}</td>
              <td>
                <button className="update-btn" onClick={() => handleUpdateClick(store)}>Update</button>
                <button className="delete-btn" onClick={() => handleDeleteClick(store.store_id)}>Delete</button>
                <button className="order-btn" onClick={() => handleOrderClick(store.store_id)}>Order</button> {/* Order button navigates to new page */}
                <button className="detail-btn" onClick={() => handleDetailClick(store.store_id,store.store_name)}>Details</button> {/*  button navigates to new page */}

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding/updating a store */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isUpdateMode ? 'Update Store' : 'Add Store'}</h2>
            <div className="input-group">
              <label>Store Name:</label>
              <input
                type="text"
                value={newStore.store_name}
                onChange={(e) => setNewStore({ ...newStore, store_name: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Address:</label>
              <input
                type="text"
                value={newStore.store_address}
                onChange={(e) => setNewStore({ ...newStore, store_address: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Store Person:</label>
              <input
                type="text"
                value={newStore.store_person}
                onChange={(e) => setNewStore({ ...newStore, store_person: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Store Person Contact #:</label>
              <input
                type="text"
                value={newStore.store_person_contact}
                onChange={(e) => setNewStore({ ...newStore, store_person_contact: e.target.value })}
              />
            </div>
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalStore;
