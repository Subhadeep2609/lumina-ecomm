import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { apiCall } from '../../utils/api';
import { showToast } from '../ui/uiSlice';
import { Shield, User, Users, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const UserManagement = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/users');
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiCall(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      dispatch(showToast({ message: `Role updated to ${newRole}`, type: 'success' }));
      fetchUsers();
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Delete user account "${name}"?`)) {
      try {
        await apiCall(`/users/${userId}`, { method: 'DELETE' });
        dispatch(showToast({ message: 'User account removed', type: 'success' }));
        fetchUsers();
      } catch (err) {
        dispatch(showToast({ message: err.message, type: 'error' }));
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl space-y-4 shadow-2xs overflow-x-auto font-body">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold font-heading text-slate-900">Registered Users & Role Control (RBAC)</h3>
          <p className="text-xs text-slate-500 font-medium">Manage buyer, seller, and admin user accounts</p>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-xl">
          Total Users: {users.length}
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">Loading users list...</div>
      ) : (
        <table className="w-full min-w-[580px] sm:min-w-[620px] text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <th className="p-3">User Profile</th>
              <th className="p-3">Email & Status</th>
              <th className="p-3">Assigned RBAC Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u._id || u.id} className="hover:bg-slate-50/80 transition">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={u.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={u.name}
                    className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200"
                  />
                  <div>
                    <strong className="block text-slate-900 font-extrabold text-sm font-heading">{u.name}</strong>
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-xs font-bold text-slate-800">{u.email}</div>
                  <div className="flex items-center gap-1 text-[11px] mt-0.5 font-bold">
                    {u.isVerified ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Email Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle size={13} /> Pending Verification
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <select
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                  >
                    <option value="user">User (Consumer)</option>
                    <option value="seller">Seller (Merchant)</option>
                    <option value="admin">Admin (Administrator)</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  <button
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                    onClick={() => handleDeleteUser(u._id || u.id, u.name)}
                    title="Delete User Account"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement;
