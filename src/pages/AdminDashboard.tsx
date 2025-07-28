
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
}

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    const res = await axios.get('https://ecommerce-server-or19.onrender.com/api/products');
    setProducts(res.data);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://ecommerce-server-or19.onrender.com/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <Link to="/admin/add-product" className="text-blue-500 underline">+ Add Product</Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {products.map(product => (
          <div key={product._id} className="border p-4 rounded shadow">
            <h3 className="font-semibold">{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => handleDelete(product._id)} className="mt-2 text-sm bg-red-500 text-white px-2 py-1 rounded">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
