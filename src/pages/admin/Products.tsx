import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { Plus, Edit, Trash2, Upload, X, Check, Eye } from 'lucide-react';

const TagInput = ({ tags, setTags, placeholder }: { tags: string[], setTags: (tags: string[]) => void, placeholder: string }) => {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const newTag = value.trim().replace(/,$/, '');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(',')) {
      addTag(value);
    } else {
      setInput(value);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/50 bg-background overflow-hidden">
      <div className="flex flex-wrap gap-2 p-2 empty:hidden">
        {tags.map((tag, index) => (
          <span key={index} className="bg-muted px-2 py-1 rounded-md text-xs flex items-center gap-1">
            {tag}
            <button type="button" onClick={() => removeTag(index)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex border-t border-border/50">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 outline-none bg-transparent text-sm min-w-0"
        />
        <button 
          type="button" 
          onClick={() => addTag(input)}
          className="px-4 bg-muted/50 hover:bg-muted text-primary transition-colors border-l border-border/50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function Products() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ categories: ['Male', 'Female', 'Couple'], filters: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'Male',
    images: [] as string[],
    topNotes: [] as string[],
    midNotes: [] as string[],
    baseNotes: [] as string[],
    sizes: [{ size: '10ml', price: '450' }, { size: '30ml', price: '1050' }, { size: '50ml', price: '1460' }],
    isFeatured: false,
    attributes: {} as Record<string, string>,
    stock: 10,
    lowStockThreshold: 5,
    notesImage: '',
    discountAmount: 0,
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notesImgRef = useRef<HTMLInputElement>(null);

  const fetchProductsAndSettings = async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        fetch('/api/products?limit=1000'),
        fetch('/api/settings')
      ]);
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || data);
      }
      
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings({
          categories: data.categories?.length > 0 ? data.categories : ['Male', 'Female', 'Unisex', 'Couple', 'All'],
          filters: data.filters || []
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndSettings();
  }, []);

  const handleOpenModal = (p: any = null) => {
    setIsPreviewMode(false);
    if (p) {
      setEditingProduct(p);
      setFormData({
        name: p.name,
        slug: p.slug || '',
        description: p.description,
        category: p.category,
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        topNotes: p.topNotes || (p.notes?.top ? p.notes.top.split(',').map((n: string) => n.trim()) : []),
        midNotes: p.midNotes || (p.notes?.middle ? p.notes.middle.split(',').map((n: string) => n.trim()) : []),
        baseNotes: p.baseNotes || (p.notes?.base ? p.notes.base.split(',').map((n: string) => n.trim()) : []),
        sizes: p.sizes ? Object.entries(p.sizes).map(([size, price]) => ({ size, price: String(price) })) : [{ size: '10ml', price: '450' }, { size: '30ml', price: '1050' }, { size: '50ml', price: '1460' }],
        isFeatured: p.isFeatured || p.featured || false,
        attributes: p.attributes || {},
        stock: p.stock !== undefined ? p.stock : 10,
        lowStockThreshold: p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5,
        notesImage: p.notesImage || '',
        discountAmount: p.discountAmount !== undefined ? p.discountAmount : 0,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        category: settings.categories[0] || 'Male',
        images: [],
        topNotes: [],
        midNotes: [],
        baseNotes: [],
        sizes: [{ size: '10ml', price: '450' }, { size: '30ml', price: '1050' }, { size: '50ml', price: '1460' }],
        isFeatured: false,
        attributes: {},
        stock: 10,
        lowStockThreshold: 5,
        notesImage: '',
        discountAmount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    
    try {
      const activeToken = token || localStorage.getItem('token');
      let validUrls: string[] = [];

      // Try batch upload first
      try {
        const batchPayload = new FormData();
        Array.from(files).forEach((file: File) => batchPayload.append('images', file));
        const batchRes = await fetch('/api/upload/multiple', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
          body: batchPayload,
        });
        if (batchRes.ok) {
          const data = await batchRes.json();
          validUrls = data.urls || [];
        } else {
          throw new Error('Batch upload failed, falling back to individual uploads');
        }
      } catch {
        // Fallback: upload individually
        console.log('[Upload] Falling back to individual uploads...');
        const uploadPromises = Array.from(files).map(async (file: File) => {
          const payload = new FormData();
          payload.append('image', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${activeToken}` },
            body: payload,
          });
          if (res.ok) {
            const data = await res.json();
            return data.url as string;
          }
          console.error(`Failed to upload ${file.name}`);
          return null;
        });
        const urls = await Promise.all(uploadPromises);
        validUrls = urls.filter((u): u is string => !!u);
      }

      if (validUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...validUrls]
        }));
        toast.success(`${validUrls.length} image(s) uploaded successfully`);
      } else {
        toast.error('No images were uploaded. Please try again.');
      }
    } catch (err: any) {
      console.error('Multi-upload error:', err);
      toast.error(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNotesImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const activeToken = token || localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
        body: uploadData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, notesImage: data.url }));
        toast.success('Notes image uploaded successfully');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (notesImgRef.current) notesImgRef.current.value = '';
    }
  };

  const removeArrayImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAttributeChange = (filterName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [filterName]: value
      }
    }));
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', price: '' }]
    }));
  };

  const updateSize = (index: number, field: 'size' | 'price', value: string) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  const removeSize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sizesObj: Record<string, number> = {};
    formData.sizes.forEach(s => {
      if (s.size && s.price) {
        sizesObj[s.size] = Number(s.price);
      }
    });

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('slug', formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('topNotes', JSON.stringify(formData.topNotes));
    submitData.append('midNotes', JSON.stringify(formData.midNotes));
    submitData.append('baseNotes', JSON.stringify(formData.baseNotes));
    submitData.append('sizes', JSON.stringify(sizesObj));
    submitData.append('isFeatured', String(formData.isFeatured));
    submitData.append('attributes', JSON.stringify(formData.attributes));
    submitData.append('stock', String(formData.stock));
    submitData.append('lowStockThreshold', String(formData.lowStockThreshold));
    submitData.append('discountAmount', String(formData.discountAmount || 0));
    submitData.append('images', JSON.stringify(formData.images));
    submitData.append('notesImage', formData.notesImage);
    if (formData.images.length > 0) {
      submitData.append('image', formData.images[0]); // Legacy compatibility
    }

    setUploading(true);
    const toastId = toast.loading(editingProduct ? 'Updating product...' : 'Creating product...');

    const activeToken = token || localStorage.getItem('token');

    if (!activeToken) {
      console.error("No token found");
      toast.error('Authentication Error: No token found. Please log in again.', { id: toastId });
      setUploading(false);
      return;
    }
    
    console.log("TOKEN:", activeToken);

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      
      const config = {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        }
      };

      let res;
      if (editingProduct) {
        res = await axios.put(url, submitData, config);
      } else {
        res = await axios.post(url, submitData, config);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully', { id: toastId });
        setIsModalOpen(false);
        fetchProductsAndSettings();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to save product: ${errorMsg}`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          fetchProductsAndSettings();
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Product</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Price</th>
              <th className="p-4 font-semibold">Stock</th>
              <th className="p-4 font-semibold">Featured</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  <img src={product.image || product.images?.[0] || 'https://via.placeholder.com/50'} alt={product.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                  <span className="font-medium text-foreground">{product.name}</span>
                </td>
                <td className="p-4 text-muted-foreground">{product.category}</td>
                <td className="p-4 text-foreground font-medium">৳{product.sizes ? Object.values(product.sizes)[0] as React.ReactNode : product.price as React.ReactNode}</td>
                <td className="p-4">
                  {product.stock <= 0 ? (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-200">Out of Stock</span>
                  ) : product.stock <= (product.lowStockThreshold || 5) ? (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-yellow-200">Low Stock ({product.stock})</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200">In Stock ({product.stock})</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{product.isFeatured || product.featured ? 'Yes' : 'No'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(product)} className="text-blue-500 hover:text-blue-700 p-2 transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((product) => (
          <div key={product._id} className="bg-card rounded-2xl shadow-sm border border-border p-4 flex flex-col gap-4 relative overflow-hidden">
            {/* Featured Badge */}
            {(product.isFeatured || product.featured) && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl z-10">
                Featured
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <img src={product.image || product.images?.[0] || 'https://via.placeholder.com/50'} alt={product.name} className="w-20 h-20 rounded-xl object-cover border border-border shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 mt-1">{product.category}</p>
                <h3 className="font-serif font-medium text-foreground text-lg leading-tight truncate">{product.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-medium text-foreground">
                    ৳{product.sizes ? Object.values(product.sizes)[0] as React.ReactNode : product.price as React.ReactNode}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                {product.stock <= 0 ? (
                  <span className="bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-md border border-red-200">Out of Stock</span>
                ) : product.stock <= (product.lowStockThreshold || 5) ? (
                  <span className="bg-yellow-50 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-md border border-yellow-200">Low Stock ({product.stock})</span>
                ) : (
                  <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-md border border-green-200">In Stock ({product.stock})</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(product)} className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(product._id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {isPreviewMode ? 'Edit Mode' : 'Preview'}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto p-8 flex-1">
              {isPreviewMode ? (
                <div className="max-w-2xl mx-auto border border-border rounded-2xl p-8 bg-card shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                        {formData.images?.[0] ? (
                          <img src={formData.images[0]} alt={formData.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{formData.category}</div>
                      <h3 className="text-3xl font-serif mb-4">{formData.name || 'Product Name'}</h3>
                      <p className="text-muted-foreground font-light mb-6">{formData.description || 'Product description will appear here.'}</p>
                      
                      <div className="mb-6">
                        <div className="text-sm font-medium mb-2">Sizes</div>
                        <div className="flex gap-2 flex-wrap">
                          {formData.sizes.filter(s => s.size).map((s, i) => (
                            <div key={i} className="px-3 py-1 border border-border rounded-md text-sm">
                              {s.size} - ৳{s.price}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {formData.topNotes.length > 0 && <div><span className="font-medium">Top:</span> {formData.topNotes.join(', ')}</div>}
                        {formData.midNotes.length > 0 && <div><span className="font-medium">Heart:</span> {formData.midNotes.join(', ')}</div>}
                        {formData.baseNotes.length > 0 && <div><span className="font-medium">Base:</span> {formData.baseNotes.join(', ')}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form id="product-form" onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-serif border-b border-border pb-2">Basic Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Slug (URL)</label>
                        <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="Leave blank to auto-generate" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-background">
                          {settings.categories.map((cat: string) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                        <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"></textarea>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                        <div>
                          <p className="font-medium text-foreground">Featured Product</p>
                          <p className="text-xs text-muted-foreground">Show this product on the homepage</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Total Stock</label>
                          <input type="number" min="0" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Low Stock Threshold</label>
                          <input type="number" min="0" required value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Discount (%)</label>
                        <div className="relative">
                          <input type="number" min="0" max="100" value={formData.discountAmount} onChange={(e) => setFormData({ ...formData, discountAmount: Math.min(100, Math.max(0, Number(e.target.value))) })} placeholder="e.g. 20" className="w-full px-4 py-3 pr-12 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Percentage off all sizes. 0 = no discount.</p>
                      </div>
                    </div>

                    {/* Details & Media */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-serif border-b border-border pb-2">Media & Details</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Product Images</label>
                        <div className="flex flex-wrap gap-4">
                          {formData.images?.map((img, idx) => (
                            <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-border group shadow-sm flex-shrink-0">
                              <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeArrayImage(idx)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors flex-shrink-0"
                          >
                            {uploading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground font-medium">Upload Images</span>
                              </>
                            )}
                          </div>
                          <input type="file" ref={fileInputRef} onChange={handleMultiImageUpload} accept="image/*" className="hidden" multiple />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Fragrance Notes Image override</label>
                        <div className="flex gap-4">
                          {formData.notesImage && (
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border group shadow-sm bg-[#faf8ff] p-2 flex-shrink-0">
                              <img src={formData.notesImage} alt="Notes" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, notesImage: '' })}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div
                            onClick={() => notesImgRef.current?.click()}
                            className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors flex-shrink-0 text-center p-2"
                          >
                            {uploading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground font-medium">Upload Notes Image</span>
                              </>
                            )}
                          </div>
                          <input type="file" ref={notesImgRef} onChange={handleNotesImageUpload} accept="image/*" className="hidden" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-foreground">Fragrance Notes</h4>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Top Notes</label>
                          <TagInput tags={formData.topNotes} setTags={(tags) => setFormData({...formData, topNotes: tags})} placeholder="Type and press Enter" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Middle Notes</label>
                          <TagInput tags={formData.midNotes} setTags={(tags) => setFormData({...formData, midNotes: tags})} placeholder="Type and press Enter" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Base Notes</label>
                          <TagInput tags={formData.baseNotes} setTags={(tags) => setFormData({...formData, baseNotes: tags})} placeholder="Type and press Enter" />
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Sizes */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-lg font-serif">Pricing & Sizes</h3>
                        <button type="button" onClick={addSize} className="text-sm flex items-center gap-1 text-primary hover:text-primary/80">
                          <Plus className="w-4 h-4" /> Add Size
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {formData.sizes.map((sizeObj, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 border border-border rounded-xl bg-muted/10">
                            <div className="flex-1">
                              <input 
                                type="text" 
                                placeholder="Size (e.g. 50ml)" 
                                value={sizeObj.size} 
                                onChange={(e) => updateSize(index, 'size', e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-border mb-2 outline-none focus:border-primary/50"
                              />
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">৳</span>
                                <input 
                                  type="number" 
                                  placeholder="Price" 
                                  value={sizeObj.price} 
                                  onChange={(e) => updateSize(index, 'price', e.target.value)}
                                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-border outline-none focus:border-primary/50"
                                />
                              </div>
                            </div>
                            <button type="button" onClick={() => removeSize(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Filters */}
                    {settings.filters && settings.filters.length > 0 && (
                      <div className="md:col-span-2 space-y-6">
                        <h3 className="text-lg font-serif border-b border-border pb-2">Product Attributes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {settings.filters.map((filter: any) => (
                            <div key={filter.name}>
                              <label className="block text-sm font-medium text-muted-foreground mb-2">{filter.name}</label>
                              <select 
                                value={formData.attributes[filter.name] || ''} 
                                onChange={(e) => handleAttributeChange(filter.name, e.target.value)} 
                                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-background"
                              >
                                <option value="">None</option>
                                {filter.options.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors" disabled={uploading}>Cancel</button>
              <button type="submit" form="product-form" disabled={uploading} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {uploading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
