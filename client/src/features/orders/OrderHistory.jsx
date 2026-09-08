import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from './orderSlice.js';
import { ShoppingBag, Package, CheckCircle2, Clock, Truck, AlertTriangle } from 'lucide-react';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { myOrders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><CheckCircle2 size={12} /> Delivered</span>;
      case 'Shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"><Truck size={12} /> Shipped</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30"><AlertTriangle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30"><Clock size={12} /> Processing</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="text-indigo-400" size={28} />
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-100">My Orders History</h1>
          <p className="text-sm text-slate-400">Track your Razorpay verified orders and fulfillment status</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading your orders...</div>
      ) : myOrders.length === 0 ? (
        <div className="p-8 text-center bg-slate-800/50 border border-slate-700 rounded-xl">
          <Package size={48} className="mx-auto text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-200">No Orders Found</h3>
          <p className="text-sm text-slate-400">Place an order using Razorpay to view tracking history here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <div key={order._id || order.id} className="p-5 bg-slate-800/80 border border-slate-700 rounded-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3 text-xs text-slate-400">
                <div>
                  <span>Order ID: </span>
                  <strong className="text-slate-200 font-mono">{order._id}</strong>
                </div>
                <div>Placed: {new Date(order.createdAt).toLocaleDateString()}</div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Items Preview */}
              <div className="space-y-2">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded bg-black" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-200">{item.title}</span>
                      <div className="text-xs text-slate-400">Qty: {item.quantity} × ${item.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-sm">
                <span className="text-xs text-emerald-400 font-semibold">✓ Razorpay Payment Confirmed</span>
                <span className="font-extrabold text-lg text-slate-100">${Number(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
