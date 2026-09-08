import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from '../features/orders/orderSlice.js';
import { Store, RefreshCw, Truck, CheckCircle2, Clock, AlertTriangle, DollarSign, Package } from 'lucide-react';

const SellerOrdersPage = () => {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAllOrdersAdmin());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatusAdmin({ orderId, orderStatus: newStatus }));
  };

  const totalRevenue = allOrders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0);
  const processingCount = allOrders.filter(o => o.orderStatus === 'Processing').length;
  const shippedCount = allOrders.filter(o => o.orderStatus === 'Shipped').length;
  const deliveredCount = allOrders.filter(o => o.orderStatus === 'Delivered').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-100">Merchant Order Management</h1>
            <p className="text-sm text-slate-400">Manage customer fulfillment, update tracking status, and monitor Razorpay revenue</p>
          </div>
        </div>

        <button className="btn btn-secondary text-xs py-2 px-4 flex items-center gap-2 rounded-xl" onClick={() => dispatch(fetchAllOrdersAdmin())}>
          <RefreshCw size={14} /> Refresh Orders
        </button>
      </div>

      {/* Merchant Order Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Total Store Orders</span>
            <h3 className="text-xl font-extrabold">{allOrders.length}</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Pending Processing</span>
            <h3 className="text-xl font-extrabold text-amber-400">{processingCount}</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">In Transit (Shipped)</span>
            <h3 className="text-xl font-extrabold text-cyan-400">{shippedCount}</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block">Total Revenue</span>
            <h3 className="text-xl font-extrabold text-emerald-400">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel p-6 overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading store orders...</div>
        ) : allOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No customer orders placed yet.</div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3">Order Details</th>
                <th className="p-3">Customer & Shipping Address</th>
                <th className="p-3">Purchased Items</th>
                <th className="p-3">Razorpay Payment</th>
                <th className="p-3">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order) => (
                <tr key={order._id || order.id} className="border-b border-slate-800/80 hover:bg-slate-900/50 transition">
                  <td className="p-3">
                    <div className="font-mono font-bold text-slate-100">{order._id}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{new Date(order.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="p-3 space-y-0.5">
                    <strong className="text-slate-200 block text-xs">{order.shippingAddress?.fullName || order.user?.name}</strong>
                    <div className="text-slate-400 text-[11px]">{order.shippingAddress?.phone}</div>
                    <div className="text-slate-500 text-[11px] truncate max-w-[200px]">
                      {order.shippingAddress?.address}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img src={item.image} alt={item.title} className="w-7 h-7 rounded object-cover bg-black" />
                          <span className="font-medium text-slate-200 text-xs truncate max-w-[160px]">{item.title}</span>
                          <span className="text-slate-400 text-[11px]">(x{item.quantity})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-black text-sm text-emerald-400 font-heading block">${Number(order.totalPrice).toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 size={10} /> Razorpay Paid
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      className="form-select w-auto text-xs py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl outline-none focus:border-purple-500"
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage;
