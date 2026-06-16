import React, { useEffect, useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { Loader2, Plus, MapPin, Trash2, Edit2, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { bdLocations, Division, District, Area } from '../../lib/locations';

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    division: '',
    district: '',
    area: '',
    fullAddress: '',
    landmark: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await customerApi.getAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await customerApi.deleteAddress(id);
      setAddresses(addresses.filter(a => a._id !== id));
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customerApi.updateAddress(id, { isDefault: true });
      fetchAddresses(); // Re-fetch to get updated list
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  const openAddModal = () => {
    setFormData({
      recipientName: '', phone: '', division: '', district: '', area: '', fullAddress: '', landmark: '', isDefault: addresses.length === 0
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (address: any) => {
    setCurrentId(address._id);
    setFormData({
      recipientName: address.recipientName || '',
      phone: address.phone || '',
      division: address.division || '',
      district: address.district || '',
      area: address.area || '',
      fullAddress: address.fullAddress || '',
      landmark: address.landmark || '',
      isDefault: address.isDefault || false
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing && currentId) {
        await customerApi.updateAddress(currentId, formData);
        toast.success('Address updated');
      } else {
        await customerApi.createAddress(formData);
        toast.success('Address added');
      }
      fetchAddresses();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  // Derived state for dropdowns
  const availableDivisions = bdLocations;
  const selectedDivisionObj = availableDivisions.find(d => d.name === formData.division);
  const availableDistricts = selectedDivisionObj ? selectedDivisionObj.districts : [];
  const selectedDistrictObj = availableDistricts.find(d => d.name === formData.district);
  const availableAreas = selectedDistrictObj ? selectedDistrictObj.areas : [];

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, division: e.target.value, district: '', area: '' });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, district: e.target.value, area: '' });
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111111]">Saved Addresses</h1>
          <p className="text-[#777777] mt-2">Manage your delivery locations.</p>
        </div>
        <button onClick={openAddModal} className="bg-[#111111] text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary transition-all flex items-center gap-2 shadow-md">
          <Plus className="w-5 h-5" />
          Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No saved addresses</h3>
          <p className="text-gray-500">Add an address for faster checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address._id} className={`border ${address.isDefault ? 'border-primary shadow-sm bg-primary/5' : 'border-gray-200 bg-white'} rounded-2xl p-6 relative group transition-all`}>
              {address.isDefault && (
                <span className="absolute -top-3 left-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" /> Default Shipping
                </span>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{address.recipientName}</h3>
                  <p className="text-sm font-medium text-gray-500">{address.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(address)} className="p-2 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(address._id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-gray-600 text-sm">
                <p className="font-medium text-gray-800">{address.fullAddress}</p>
                <p>{address.area}, {address.district}, {address.division}</p>
                {address.landmark && <p className="text-gray-400 italic">Landmark: {address.landmark}</p>}
              </div>

              {!address.isDefault && (
                <button 
                  onClick={() => handleSetDefault(address._id)}
                  className="mt-6 text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Star className="w-4 h-4" /> Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center z-10">
              <h2 className="text-2xl font-serif font-bold text-[#111111]">
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Division *</label>
                  <select
                    required
                    value={formData.division}
                    onChange={handleDivisionChange}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none"
                  >
                    <option value="">Select Division</option>
                    {availableDivisions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">District *</label>
                  <select
                    required
                    disabled={!formData.division}
                    value={formData.district}
                    onChange={handleDistrictChange}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Area / Thana *</label>
                  <select
                    required
                    disabled={!formData.district}
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium appearance-none disabled:opacity-50"
                  >
                    <option value="">Select Area</option>
                    {availableAreas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Full Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullAddress}
                    onChange={(e) => setFormData({...formData, fullAddress: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    placeholder="House No, Road No, Block, etc."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase font-bold tracking-widest text-[#555555] ml-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    placeholder="Near mosque, beside hospital, etc."
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isDefault" className="font-medium text-gray-700 cursor-pointer">Set as default shipping address</label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-primary transition-all duration-300 shadow-md disabled:opacity-70 flex justify-center items-center"
                >
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
