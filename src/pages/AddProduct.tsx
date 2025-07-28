
import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const token = localStorage.getItem('token');

  const handleAdd = async () => {
    try {
      await axios.post('https://ecommerce-server-or19.onrender.com/api/products', { name, price }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product added!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      <input className="w-full border p-2 mb-2" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="w-full border p-2 mb-4" type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
      <button onClick={handleAdd} className="w-full bg-green-600 text-white py-2 rounded">Add</button>
    </div>
  );
};

export default AddProduct;
