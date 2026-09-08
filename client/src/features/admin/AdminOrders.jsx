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
    <div className="p-4 sm:p-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl space-y-4 shadow-2xs overflow-x-auto font-body">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold font-heading text-slate-900">Customer Orders & Fulfillment Control</h3>
          <p className="text-xs text-slate-500 font-medium">Update order dispatch status and monitor payments</p>
        </div>
        <button className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 p-2 rounded-xl hover:bg-slate-100 transition border border-slate-200" onClick={() => dispatch(fetchAllOrdersAdmin())}>
          <RefreshCw size={14} /> Refresh Orders
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs font-medium">Loading orders...</div>
      ) : allOrders.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs font-medium">No customer orders placed yet.</div>
      ) : (
        <table className="w-full min-w-[680px] text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <th className="p-3">Order ID / Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items & Quantity</th>
              <th className="p-3">Total Amount</th>
              <th className="p-3">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allOrders.map((order) => (
              <tr key={order._id || order.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3">
                  <div className="font-mono font-bold text-slate-900">{order._id}</div>
                  <div className="text-slate-500 text-[11px]">{new Date(order.createdAt).toLocaleString()}</div>
                </td>
                <td className="p-3">
                  <strong className="text-slate-900 block font-heading">{order.user?.name || 'Customer'}</strong>
                  <span className="text-slate-500 text-[11px]">{order.user?.email || order.shippingAddress?.fullName}</span>
                </td>
                <td className="p-3">
                  <div className="space-y-1">
                    {order.orderItems?.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <span className="text-slate-500 text-[11px]">(x{item.quantity})</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-3 font-black text-slate-900 text-sm font-mono">
                  ${Number(order.totalPrice).toFixed(2)}
                </td>
                <td className="p-3">
                  <select
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
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
