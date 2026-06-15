import React, { useEffect, useState } from 'react';
import { customerApi } from '../../lib/customerApi';
import { Loader2, Plus, MapPin, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111111]">Saved Addresses</h1>
          <p className="text-[#777777] mt-2">Manage your shipping and billing addresses.</p>
        </div>
        <button className="bg-[#111111] text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary transition-all flex items-center gap-2">
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
            <div key={address._id} className="border border-gray-200 rounded-2xl p-6 relative group hover:border-primary/50 hover:shadow-md transition-all">
              {address.isDefault && (
                <span className="absolute -top-3 left-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Default {address.type}
                </span>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-900">{address.fullName}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(address._id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-gray-600">
                <p>{address.phone}</p>
                <p className="mt-2">{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.zip}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
