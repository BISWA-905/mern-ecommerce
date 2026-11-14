import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Load everyone when the tab opens
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Could not load the users.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Make someone an admin, or take it away
  const changeRole = async (id, role) => {
    setBusyId(id);
    setError('');
    try {
      const { data } = await api.put(`/users/${id}/role`, { role });
      setUsers((list) =>
        list.map((u) => (u._id === id ? { ...u, role: data.role } : u))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the role.');
    } finally {
      setBusyId(null);
    }
  };

  // Delete a user, after asking "are you sure?"
  const removeUser = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    setBusyId(id);
    setError('');
    try {
      await api.delete(`/users/${id}`);
      setUsers((list) => list.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the user.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="h-48 rounded-xl bg-gray-200 animate-pulse" />;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-3">
        {users.length} user{users.length === 1 ? '' : 's'}
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const isMe = u._id === me?._id;
              return (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.name} {isMe && <span className="text-gray-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isMe ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            changeRole(u._id, u.role === 'admin' ? 'user' : 'admin')
                          }
                          disabled={busyId === u._id}
                          className="text-indigo-600 hover:underline disabled:opacity-40"
                        >
                          {u.role === 'admin' ? 'Make user' : 'Make admin'}
                        </button>
                        <button
                          onClick={() => removeUser(u._id, u.name)}
                          disabled={busyId === u._id}
                          className="text-red-600 hover:underline disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;