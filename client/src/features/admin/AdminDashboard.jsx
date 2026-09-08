import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../ui/uiSlice.js';
import { deleteProduct, fetchProducts } from '../products/productSlice.js';
import { apiCall } from '../../utils/api.js';
import UserManagement from './UserManagement.jsx';
import AdminOrders from './AdminOrders.jsx';
import { Shield, Package, Users, DollarSign, PlusCircle, Edit3, Trash2, Layers, AlertCircle, RefreshCw, ShoppingBag } from 'lucide-react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { products, totalProducts } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    categoriesCount: 0,
    avgPrice: '0.00'
  });

  const loadStats = async () => {
    try {
      const data = await apiCall('/products/stats/summary');
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Could not load stats:', err);
    }
  };

  useEffect(() => {
    dispatch(fetchProducts());
    loadStats();
  }, [dispatch]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Admin Action: Permanently remove "${title}" from catalog?`)) {
      dispatch(deleteProduct(id));
      loadStats();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 pt-3 sm:pt-4 px-2 sm:px-4 font-body">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={24} className="text-rose-600 sm:w-6.5 sm:h-6.5" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">Admin Control Dashboard</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Role-Based Access Control (RBAC), Global Orders & Product Catalog Management
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            className={`text-xs font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={14} /> Catalog ({products.length})
          </button>
          <button
            className={`text-xs font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={14} /> Orders
          </button>
          <button
            className={`text-xs font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={14} /> Roles
          </button>
          <button
            className="text-xs font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-md hover:from-emerald-700 hover:to-teal-700 transition flex items-center gap-1.5 active:scale-95"
            onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM' }))}
          >
            <PlusCircle size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Package size={20} className="sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-extrabold uppercase block">Catalog Total</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">{stats.totalProducts || totalProducts}</h3>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertCircle size={20} className="sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-extrabold uppercase block">Out of Stock</span>
            <h3 className="text-xl sm:text-2xl font-black text-rose-600 font-heading">{stats.outOfStock}</h3>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Layers size={20} className="sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-extrabold uppercase block">Categories</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">{stats.categoriesCount || 6}</h3>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 bg-white border border-slate-200/90 rounded-2xl flex items-center gap-3 sm:gap-3.5 shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign size={20} className="sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-extrabold uppercase block">Avg Price</span>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 font-heading">${stats.avgPrice}</h3>
          </div>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="p-4 sm:p-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl space-y-4 shadow-2xs overflow-x-auto">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm sm:text-base font-extrabold font-heading text-slate-900">Inventory Catalog Management</h3>
            <button className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 transition" onClick={() => dispatch(fetchProducts())}>
              <RefreshCw size={14} /> Refresh Catalog
            </button>
          </div>

          {products.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">No products in database catalog. Click "Add Product" to create one.</div>
          ) : (
            <table className="w-full min-w-[640px] text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={(p.images && p.images.length > 0) ? p.images[0].url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={p.title}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <strong className="block text-slate-900 font-extrabold text-sm font-heading">{p.title}</strong>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase">{p.brand || 'Lumina Genuine'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-black bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 font-black text-slate-900 text-sm">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={p.stock > 0 ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                        {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-500">★ {p.rating || 4.8}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM', product: p }))}
                          title="Edit Product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          onClick={() => handleDelete(p._id || p.id, p.title)}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : activeTab === 'orders' ? (
        <AdminOrders />
      ) : (
        <UserManagement />
      )}
    </div>
  );
};

export default AdminDashboard;
