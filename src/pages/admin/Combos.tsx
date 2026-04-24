import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus, Edit, Trash2, Upload, X, Check, Eye } from 'lucide-react';

export default function Combos() {
  const { token } = useAuthStore();
  const [combos, setCombos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingCombo, setEditingCombo] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    price: '',
    category: 'Male',
    image: '',
    selectedProducts: [] as string[],
    featured: false,
    isCustomizable: false,
    customSize: '0',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [combosRes, productsRes] = await Promise.all([
        fetch('/api/combos'),
        fetch('/api/products?limit=1000'),
      ]);
      if (combosRes.ok && productsRes.ok) {
        const cData = await combosRes.json();
        const pData = await productsRes.json();
        console.log("combos:", cData);
        
        // Ensure data is array and safely pad products array
        const safeCombos = Array.isArray(cData) ? cData.map((c: any) => ({
          ...c,
          products: c.products || []
        })) : [];
        
        setCombos(safeCombos);
        setProducts(pData.products || pData || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (combo: any = null) => {
    setIsPreviewMode(false);
    if (combo) {
      setEditingCombo(combo);
      setFormData({
        name: combo.name,
        description: combo.description,
        price: combo.price.toString(),
        category: combo.category || 'Male',
        selectedProducts: (combo.products || []).map((p: any) => p._id || p),
        featured: combo.featured || false,
        isCustomizable: combo.isCustomizable || false,
        customSize: (combo.customSize || 0).toString(),
      });
    } else {
      setEditingCombo(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Male',
        selectedProducts: [],
        featured: false,
        isCustomizable: false,
        customSize: '0',
      });
    }
    setIsModalOpen(true);
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedProducts.includes(productId);
      if (isSelected) {
        return { ...prev, selectedProducts: prev.selectedProducts.filter((id) => id !== productId) };
      } else {
        return { ...prev, selectedProducts: [...prev.selectedProducts, productId] };
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto calculate included perfumes based on selected products
    const includedPerfumes = (formData.selectedProducts || [])
      .map((id: string) => products.find(p => p._id === id)?.name)
      .filter(Boolean);

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image,
      products: formData.selectedProducts,
      includedPerfumes,
      featured: formData.featured,
      isCustomizable: formData.isCustomizable,
      customSize: Number(formData.customSize),
    };

    try {
      const url = editingCombo ? `/api/combos/${editingCombo._id}` : '/api/combos';
      const method = editingCombo ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert('Failed to save combo');
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this combo?')) {
      try {
        const res = await fetch(`/api/combos/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          fetchData();
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  const selectedProductNames = (formData.selectedProducts || [])
    .map((id: string) => {
      try {
        return products && Array.isArray(products) ? products.find(p => p._id === id)?.name : null;
      } catch (e) { return null; }
    })
    .filter(Boolean);

  try {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-bold text-foreground">Combos</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Combo
          </button>
        </div>

        {(!combos || combos.length === 0) && (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-12 text-center flex flex-col items-center justify-center">
            <p className="text-xl font-serif font-bold text-muted-foreground mb-2">No Combos Available</p>
            <p className="text-muted-foreground">Click 'Add Combo' to create your first bundle.</p>
          </div>
        )}

        {(combos && combos.length > 0) && (
          <>
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Combo</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Products Included</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(combos || []).map((combo) => (
                    <tr key={combo._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <img src={combo.image || 'https://via.placeholder.com/50'} alt={combo.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-medium text-foreground">{combo.name}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">{combo.category}</td>
                      <td className="p-4 text-foreground font-medium">৳{combo.price}</td>
                      <td className="p-4 text-muted-foreground">{(combo.products || []).length} items</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleOpenModal(combo)} className="text-blue-500 hover:text-blue-700 p-2 transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(combo._id)} className="text-red-500 hover:text-red-700 p-2 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {(combos || []).map((combo) => (
                <div key={combo._id} className="bg-card rounded-2xl shadow-sm border border-border p-4 flex flex-col gap-4 relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <img src={combo.image || 'https://via.placeholder.com/50'} alt={combo.name} className="w-20 h-20 rounded-xl object-cover border border-border shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 mt-1">{combo.category}</p>
                      <h3 className="font-serif font-medium text-foreground text-lg leading-tight truncate">{combo.name}</h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {(combo.products || []).length} items included
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="font-medium text-foreground text-lg">
                      ৳{combo.price}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(combo)} className="bg-muted hover:bg-muted/80 text-foreground p-2 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(combo._id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-2xl font-serif font-bold text-foreground">
                {editingCombo ? 'Edit Combo' : 'Add New Combo'}
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
                        {formData.image ? (
                          <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{formData.category}</div>
                      <h3 className="text-3xl font-serif mb-4">{formData.name || 'Combo Name'}</h3>
                      <div className="text-2xl font-medium mb-6">৳{formData.price || '0'}</div>
                      <p className="text-muted-foreground font-light mb-6">{formData.description || 'Combo description will appear here.'}</p>
                      
                      <div className="mb-6">
                        <div className="text-sm font-medium mb-3">Included Perfumes</div>
                        <ul className="space-y-2">
                          {selectedProductNames.length > 0 ? (
                            selectedProductNames.map((name, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-primary" />
                                {name}
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground italic">No products selected</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form id="combo-form" onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-serif border-b border-border pb-2">Basic Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none bg-background">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Couple">Couple</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Price (৳)</label>
                        <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                        <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none"></textarea>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                        <div>
                          <p className="font-medium text-foreground">Featured Combo</p>
                          <p className="text-xs text-muted-foreground">Highlight this combo on the shop page</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-muted/20">
                        <div>
                          <p className="font-medium text-foreground">Customizable Combo</p>
                          <p className="text-xs text-muted-foreground">Allows users to pick their own perfumes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={formData.isCustomizable} onChange={(e) => setFormData({ ...formData, isCustomizable: e.target.checked })} />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {formData.isCustomizable && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">Maximum Combo Size Limit (Items)</label>
                          <input type="number" required={formData.isCustomizable} value={formData.customSize} onChange={(e) => setFormData({ ...formData, customSize: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" min="1"/>
                        </div>
                      )}
                    </div>

                    {/* Media & Products */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-serif border-b border-border pb-2">Media & Products</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Combo Image</label>
                        <div className="flex flex-wrap gap-4">
                          {formData.image && (
                            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border group shadow-sm">
                              <img src={formData.image} alt="Combo" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                          >
                            {uploading ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground font-medium">Upload Image</span>
                              </>
                            )}
                          </div>
                          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-muted-foreground">Select Products</label>
                          <span className="text-xs text-muted-foreground">{(formData.selectedProducts || []).length} selected</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 border border-border rounded-xl bg-muted/10">
                          {products.map((product) => (
                            <label key={product._id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                              <input
                                type="checkbox"
                                checked={(formData.selectedProducts || []).includes(product._id)}
                                onChange={() => handleProductToggle(product._id)}
                                className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                              />
                              <div className="flex items-center gap-2">
                                <img src={product.image || product.images?.[0] || 'https://via.placeholder.com/20'} alt={product.name} className="w-6 h-6 rounded object-cover" />
                                <span className="text-sm text-foreground font-medium">{product.name}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                        {selectedProductNames.length > 0 && (
                          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <h4 className="text-xs font-medium text-primary mb-2 uppercase tracking-wider">Auto-calculated Content</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedProductNames.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex justify-end gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" form="combo-form" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2">
                <Check className="w-5 h-5" />
                Save Combo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (err: any) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-200 shadow-sm mt-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">⚠️ React Runtime Crash Prevented</h2>
        <div className="bg-card p-6 rounded-xl overflow-auto border border-red-100">
           <p className="font-mono text-sm whitespace-pre-wrap">{err.message}</p>
           <p className="font-mono text-xs whitespace-pre-wrap mt-4 text-red-400">{err.stack}</p>
        </div>
        <p className="mt-4 font-bold">Data Dump:</p>
        <pre className="text-[10px] mt-2 overflow-auto max-h-64 bg-card p-4">
          {JSON.stringify({ combos, products }, null, 2)}
        </pre>
      </div>
    );
  }
}
