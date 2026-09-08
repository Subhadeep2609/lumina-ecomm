import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrdersAdmin, updateOrderStatusAdmin } from '../orders/orderSlice.js';
import { ShoppingBag, RefreshCw, Truck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchAllOrdersAdmin());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatusAdmin({ orderId, orderStatus: newStatus }));
  };

  return (
    <div className="glass-panel p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold font-heading text-slate-100">Customer Orders & Fulfillment Control</h3>
        <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={() => dispatch(fetchAllOrdersAdmin())}>
          <RefreshCw size={14} /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400">Loading orders...</div>
      ) : allOrders.length === 0 ? (
        <div className="py-8 text-center text-slate-400">No customer orders placed yet.</div>
      ) : (
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="p-3">Order ID / Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items & Quantity</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order) => (
              <tr key={order._id || order.id} className="border-b border-slate-700/60">
                <td className="p-3">
                  <div className="font-mono font-bold text-slate-200">{order._id}</div>
                  <div className="text-slate-500 text-[11px]">{new Date(order.createdAt).toLocaleString()}</div>
                </td>
                <td className="p-3">
                  <strong className="text-slate-200 block">{order.user?.name || 'Customer'}</strong>
                  <span className="text-slate-400 text-[11px]">{order.user?.email || order.shippingAddress?.fullName}</span>
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    {order.orderItems?.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{item.title}</span>
                        <span className="text-slate-400">(x{item.quantity})</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-3 font-bold text-emerald-400 text-sm">
                  ${Number(order.totalPrice).toFixed(2)}
                </td>
                <td className="p-3">
                  <select
                    className="form-select w-auto text-xs py-1 px-2 h-8 bg-slate-900 border-slate-700 text-slate-200 rounded"
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
  );
};

export default AdminOrders;
