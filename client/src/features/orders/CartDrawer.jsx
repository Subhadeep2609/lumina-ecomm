import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, checkoutRazorpayOrder } from './orderSlice.js';
import { closeModal } from '../ui/uiSlice.js';
import { ShoppingBag, X, Trash2, Plus, Minus, CreditCard, ShieldCheck, MapPin } from 'lucide-react';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.ui);
  const { cartItems, loading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: 'Demo Customer',
    address: '123 Tech Park Avenue',
    city: 'Bangalore',
    postalCode: '560001',
    phone: '+91 9876543210'
  });

  if (activeModal !== 'CART') return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to proceed with Razorpay checkout.');
      return;
    }
    dispatch(checkoutRazorpayOrder({ shippingAddress }));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div className="modal-card max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-indigo-400" size={22} />
            <h2 className="text-xl font-bold font-heading">Shopping Cart ({cartItems.length})</h2>
          </div>
          <button onClick={() => dispatch(closeModal())} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-slate-500 mb-3" />
            <p className="text-slate-400 font-medium">Your cart is currently empty.</p>
          </div>
        ) : (
          <div>
            {/* Items List */}
            <div className="max-h-60 overflow-y-auto pr-1 space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item._id || item.id} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-700 rounded-lg">
                  <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-md bg-black" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-slate-100">{item.title}</h4>
                    <span className="text-emerald-400 font-bold text-sm">${Number(item.price).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => dispatch(updateQuantity({ id: item._id || item.id, quantity: item.quantity - 1 }))}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => dispatch(updateQuantity({ id: item._id || item.id, quantity: item.quantity + 1 }))}
                      disabled={typeof item.stock === 'number' && item.quantity >= item.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item._id || item.id))}
                    className="p-1.5 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Shipping Info Form */}
            <form onSubmit={handleCheckout} className="space-y-3 border-t border-slate-700 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
                <MapPin size={16} />
                <span>Shipping Address</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 outline-none focus:border-indigo-500"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                />
                <input
                  type="text"
                  required
                  placeholder="Phone"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 outline-none focus:border-indigo-500"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                />
              </div>

              <input
                type="text"
                required
                placeholder="Address Line"
                className="w-full p-2 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 outline-none focus:border-indigo-500"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="City"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 outline-none focus:border-indigo-500"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
                <input
                  type="text"
                  required
                  placeholder="Postal Code"
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-slate-100 outline-none focus:border-indigo-500"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-3 text-base">
                <span className="font-semibold text-slate-300">Total Payable:</span>
                <span className="font-extrabold text-2xl text-emerald-400">${totalAmount.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm transition"
              >
                <CreditCard size={18} />
                <span>{loading ? 'Processing Payment...' : 'Pay with Razorpay'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
