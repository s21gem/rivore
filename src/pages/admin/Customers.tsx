import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Calendar, Search, Award, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Customers() {
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  // Rewards state
  const [rewardAction, setRewardAction] = useState<'add' | 'remove' | 'set'>('add');
  const [rewardAmount, setRewardAmount] = useState<number | ''>('');
  const [rewardDescription, setRewardDescription] = useState('');
  const [updatingReward, setUpdatingReward] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleUpdateReward = async () => {
    if (!selectedCustomer || rewardAmount === '' || Number(rewardAmount) <= 0) return;
    setUpdatingReward(true);
    try {
      const response = await fetch(`/api/admin/customers/${selectedCustomer._id}/rewards`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: rewardAction,
          amount: Number(rewardAmount),
          description: rewardDescription
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        const updatedCustomers = customers.map(c => {
          if (c._id === selectedCustomer._id) {
            return { ...c, reward: data.reward };
          }
          return c;
        });
        setCustomers(updatedCustomers);
        setSelectedCustomer({ ...selectedCustomer, reward: data.reward });
        setRewardAmount('');
        setRewardDescription('');
      } else {
        alert('Failed to update reward points');
      }
    } catch (error) {
      console.error('Error updating rewards:', error);
      alert('Error updating rewards');
    } finally {
      setUpdatingReward(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customers by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Customer</th>
                <th className="p-4 font-semibold text-gray-600">Contact</th>
                <th className="p-4 font-semibold text-gray-600">Joined</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Points</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Addresses</th>
                <th className="p-4 font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No customers found</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                          {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.fullName || 'No Name'}</p>
                          {customer.gender && <p className="text-xs text-gray-500">{customer.gender}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {customer.email}</p>
                        {customer.phone && <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {customer.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1 justify-center w-fit mx-auto">
                        <Award className="w-3 h-3" />
                        {customer.reward?.points || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">
                        {customer.addresses?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-primary font-medium hover:underline text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600">
                &times; Close
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Profile</h3>
                  <div className="space-y-3">
                    <p><span className="text-gray-500 w-24 inline-block">Name:</span> <strong className="text-gray-900">{selectedCustomer.fullName}</strong></p>
                    <p><span className="text-gray-500 w-24 inline-block">Email:</span> <strong className="text-gray-900">{selectedCustomer.email}</strong></p>
                    <p><span className="text-gray-500 w-24 inline-block">Phone:</span> <strong className="text-gray-900">{selectedCustomer.phone || '-'}</strong></p>
                    <p><span className="text-gray-500 w-24 inline-block">Gender:</span> <strong className="text-gray-900">{selectedCustomer.gender || '-'}</strong></p>
                    <p><span className="text-gray-500 w-24 inline-block">DOB:</span> <strong className="text-gray-900">{selectedCustomer.dob ? new Date(selectedCustomer.dob).toLocaleDateString() : '-'}</strong></p>
                  </div>
                </div>

                {/* Rewards Section */}
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" /> Reward Points
                    </h3>
                    <span className="text-2xl font-bold text-amber-600">{selectedCustomer.reward?.points || 0}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select 
                        value={rewardAction}
                        onChange={(e: any) => setRewardAction(e.target.value)}
                        className="px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                        <option value="set">Set To</option>
                      </select>
                      <input 
                        type="number"
                        min="1"
                        placeholder="Points"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(e.target.value ? Number(e.target.value) : '')}
                        className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <input 
                      type="text"
                      placeholder="Reason / Description (optional)"
                      value={rewardDescription}
                      onChange={(e) => setRewardDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button 
                      onClick={handleUpdateReward}
                      disabled={updatingReward || !rewardAmount}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {updatingReward ? 'Updating...' : 'Update Points'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Address Book ({selectedCustomer.addresses?.length || 0})</h3>
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedCustomer.addresses.map((addr: any) => (
                      <div key={addr._id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                        {addr.isDefault && (
                          <span className="absolute top-2 right-2 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-primary" /> {addr.recipientName}
                        </h4>
                        <p className="text-sm font-medium text-gray-700 mb-1">{addr.phone}</p>
                        <p className="text-xs text-gray-600 mb-1">{addr.fullAddress}</p>
                        <p className="text-xs text-gray-500">{addr.area}, {addr.district}, {addr.division}</p>
                        {addr.landmark && <p className="text-[10px] text-gray-400 mt-2">Landmark: {addr.landmark}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl text-center">No addresses saved.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
