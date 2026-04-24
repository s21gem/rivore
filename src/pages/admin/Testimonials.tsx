import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';

export interface Testimonial {
  _id: string;
  name: string;
  message: string;
  rating: number;
  image?: string;
  isActive: boolean;
}

export default function Testimonials() {
  const { token } = useAuthStore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    rating: 5,
    image: '',
    imageFile: null as File | null,
    isActive: true,
  });

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenModal = (item: Testimonial | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        message: item.message,
        rating: item.rating,
        image: item.image,
        imageFile: null,
        isActive: item.isActive,
      });
      setImagePreview(item.image);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        message: '',
        rating: 5,
        image: '',
        imageFile: null,
        isActive: true,
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('message', formData.message);
      submitData.append('rating', String(formData.rating));
      submitData.append('isActive', String(formData.isActive));
      
      // If a new image was selected, append the file
      if (formData.imageFile) {
        submitData.append('image', formData.imageFile);
      } else if (formData.image) {
        // If editing an existing item and no new file was selected, pass the existing string back
        submitData.append('image', formData.image);
      }

      const url = editingItem ? `/api/testimonials/${editingItem._id}` : '/api/testimonials';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // DO NOT explicitly set Content-Type to multipart/form-data. fetch automatically sets the boundary for FormData.
        },
        body: submitData,
      });

      if (res.ok) {
        toast.success(`Testimonial ${editingItem ? 'updated' : 'added'} successfully`);
        setIsModalOpen(false);
        fetchTestimonials();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error saving testimonial');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          toast.success('Testimonial deleted');
          fetchTestimonials();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  if (loading) return <div>Loading testimonials...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Testimonials</h2>
          <p className="text-muted-foreground">Manage customer reviews displayed on the homepage.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted text-muted-foreground text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {testimonials.map((item) => (
                <tr key={item._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary font-bold">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-[#C9A96E]">
                      {[...Array(item.rating)].map((_, i) => <span key={i}>★</span>)}
                      {[...Array(5 - item.rating)].map((_, i) => <span key={i} className="text-gray-300">★</span>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">
                    {item.message}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No testimonials found. Add your first review!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-serif font-bold text-foreground">
                {editingItem ? 'Edit Testimonial' : 'New Testimonial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium mb-2">Customer Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Avatar Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-dashed border-gray-400">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-primary rounded border-border"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Visible on Website)</label>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground px-8 py-2 rounded-full font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
