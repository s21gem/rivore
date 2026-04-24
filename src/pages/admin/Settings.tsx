import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, X, Upload, Save, ChevronDown } from 'lucide-react';
import Loader from '../../components/Loader';

const ICON_OPTIONS = [
  'Clock', 'Sparkles', 'Gem', 'Heart', 'Star', 'Shield', 'Award', 'Zap',
  'Leaf', 'Droplet', 'Sun', 'Moon', 'Crown', 'Diamond', 'Gift', 'Package',
  'Truck', 'Globe', 'Check', 'ThumbsUp'
];

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'branding', label: 'Branding' },
  { id: 'homepage', label: 'Homepage CMS' },
  { id: 'store', label: 'Store Location' },
  { id: 'contact', label: 'Contact Page' },
  { id: 'categories', label: 'Categories & Filters' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'payment', label: 'Payment Gateways' },
  { id: 'delivery', label: 'Delivery Settings' },
  { id: 'social', label: 'Social Links' },
];

export default function Settings() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<any>({
    metaPixelId: '',
    storeName: '',
    shippingCharge: 0,
    contactEmail: '',
    contactPhone: '',
    heroImage: '',
    heroImages: [] as string[],
    comboSectionImage: '',
    categories: [] as string[],
    filters: [] as { name: string; options: string[] }[],
    invoiceCompanyName: 'Rivoré',
    invoiceAddress: 'Dhaka, Bangladesh',
    invoicePhone: '',
    invoiceEmail: 'contact@rivore.com',
    invoiceFooter: 'Thank you for choosing Rivoré. Crafted with Elegance.',
    invoiceLogo: '',
    logoDark: '',
    logoWhite: '',
    fragranceNotesImage: '',
    // CMS fields
    bannerEnabled: true,
    bannerMessages: ['Free Shipping on orders over ৳5000', 'Visit our new flagship store at Banani', 'Use code RIVORE10 for 10% off', 'Luxury Fragrances Reimagined'],
    signatureProducts: [] as { productId: string; tagline: string }[],
    bestSellerSliderItems: [] as { image: string; productId: string; title: string }[],
    whyRivoreItems: [] as { icon: string; title: string; description: string }[],
    storeLocationName: 'RIVORÉ Flagship Store',
    storeLocationAddress: 'House 50, Road 11\nBlock F, Banani\nDhaka 1213, Bangladesh',
    storeLocationHours: '11:00 AM - 9:00 PM (Everyday)',
    storeLocationMapUrl: 'https://maps.google.com',
    storeLocationImage: '',
    contactMapEmbedUrl: '',
    contactServiceEmail: 'support@rivore.com',
    contactServicePhone: '',
    contactHeadquartersAddress: '',
    socialFacebook: '',
    socialInstagram: '',
    socialTiktok: '',
    socialWhatsapp: '',
    paymentBkash: { merchantId: '', apiKey: '', apiSecret: '', enabled: false },
    paymentSslCommerz: { storeId: '', storePassword: '', enabled: false, isLive: false },
    paymentUddoktaPay: { apiKey: '', enabled: false, isLive: false },
    deliverySteadfast: { enabled: false, apiKey: '', secretKey: '', baseUrl: 'https://portal.packzy.com/api/v1', autoSend: false },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Upload states
  const [uploadingHeroImg, setUploadingHeroImg] = useState(false);
  const [uploadingComboImg, setUploadingComboImg] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [uploadingLogoWhite, setUploadingLogoWhite] = useState(false);
  const [uploadingNotesImg, setUploadingNotesImg] = useState(false);
  const [uploadingStoreImg, setUploadingStoreImg] = useState(false);
  const heroImgRef = useRef<HTMLInputElement>(null);
  const comboImgRef = useRef<HTMLInputElement>(null);
  const logoDarkRef = useRef<HTMLInputElement>(null);
  const logoWhiteRef = useRef<HTMLInputElement>(null);
  const notesImgRef = useRef<HTMLInputElement>(null);
  const storeImgRef = useRef<HTMLInputElement>(null);

  const [newCategory, setNewCategory] = useState('');
  const [newFilterName, setNewFilterName] = useState('');
  const [newFilterOptions, setNewFilterOptions] = useState('');
  const [newBannerMsg, setNewBannerMsg] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/settings/admin', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/products?limit=1000'),
        ]);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings((prev: any) => ({
            ...prev,
            ...data,
            categories: data.categories || ['Male', 'Female', 'Couple'],
            filters: data.filters || [],
            bannerMessages: data.bannerMessages || prev.bannerMessages,
            heroImages: data.heroImages || (data.heroImage ? [data.heroImage] : []),
            signatureProducts: data.signatureProducts || [],
            bestSellerSliderItems: data.bestSellerSliderItems || [],
            whyRivoreItems: data.whyRivoreItems || [],
            paymentBkash: { ...prev.paymentBkash, ...data.paymentBkash },
            paymentSslCommerz: { ...prev.paymentSslCommerz, ...data.paymentSslCommerz },
            paymentUddoktaPay: { ...prev.paymentUddoktaPay, ...data.paymentUddoktaPay },
            deliverySteadfast: { ...prev.deliverySteadfast, ...data.deliverySteadfast },
          }));
        }
        if (productsRes.ok) {
          const pData = await productsRes.json();
          setAllProducts(pData.products || pData || []);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Generic image upload
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    setUploading: (v: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev: any) => ({ ...prev, [field]: data.url }));
      } else {
        alert('Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // Multi-image upload helper
  const handleMultiImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    setUploading: (v: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    
    try {
      let validUrls: string[] = [];

      // Try batch upload first
      try {
        const batchPayload = new FormData();
        Array.from(files).forEach((file: File) => batchPayload.append('images', file));
        const batchRes = await fetch('/api/upload/multiple', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: batchPayload,
        });
        if (batchRes.ok) {
          const data = await batchRes.json();
          validUrls = data.urls || [];
        } else {
          throw new Error('Batch upload failed');
        }
      } catch {
        // Fallback: upload individually
        console.log('[Upload] Falling back to individual uploads...');
        const uploadPromises = Array.from(files).map(async (file: File) => {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            return data.url as string;
          }
          return null;
        });
        const urls = await Promise.all(uploadPromises);
        validUrls = urls.filter((u): u is string => !!u);
      }

      if (validUrls.length > 0) {
        setSettings((prev: any) => ({
          ...prev,
          [field]: [...(prev[field] || []), ...validUrls]
        }));
      } else {
        alert('No images were uploaded. Please try again.');
      }
    } catch (err) {
      console.error('Multi-upload error:', err);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeArrayImage = (field: string, index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  // Category helpers
  const addCategory = () => {
    if (newCategory.trim() && !settings.categories.includes(newCategory.trim())) {
      setSettings((prev: any) => ({ ...prev, categories: [...prev.categories, newCategory.trim()] }));
      setNewCategory('');
    }
  };
  const removeCategory = (cat: string) => {
    setSettings((prev: any) => ({ ...prev, categories: prev.categories.filter((c: string) => c !== cat) }));
  };

  // Filter helpers
  const addFilter = () => {
    if (newFilterName.trim() && newFilterOptions.trim()) {
      const options = newFilterOptions.split(',').map(o => o.trim()).filter(o => o);
      if (options.length > 0) {
        setSettings((prev: any) => ({ ...prev, filters: [...prev.filters, { name: newFilterName.trim(), options }] }));
        setNewFilterName('');
        setNewFilterOptions('');
      }
    }
  };
  const removeFilter = (index: number) => {
    setSettings((prev: any) => ({ ...prev, filters: prev.filters.filter((_: any, i: number) => i !== index) }));
  };

  // Banner helpers
  const addBannerMsg = () => {
    if (newBannerMsg.trim()) {
      setSettings((prev: any) => ({ ...prev, bannerMessages: [...prev.bannerMessages, newBannerMsg.trim()] }));
      setNewBannerMsg('');
    }
  };
  const removeBannerMsg = (index: number) => {
    setSettings((prev: any) => ({ ...prev, bannerMessages: prev.bannerMessages.filter((_: any, i: number) => i !== index) }));
  };

  // Signature product helpers
  const addSignatureProduct = () => {
    if (settings.signatureProducts.length < 6) {
      setSettings((prev: any) => ({ ...prev, signatureProducts: [...prev.signatureProducts, { productId: '', tagline: '' }] }));
    }
  };
  const updateSignatureProduct = (index: number, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      signatureProducts: prev.signatureProducts.map((sp: any, i: number) => i === index ? { ...sp, [field]: value } : sp)
    }));
  };
  const removeSignatureProduct = (index: number) => {
    setSettings((prev: any) => ({ ...prev, signatureProducts: prev.signatureProducts.filter((_: any, i: number) => i !== index) }));
  };

  // Why Rivore helpers
  const addWhyRivoreItem = () => {
    if (settings.whyRivoreItems.length < 6) {
      setSettings((prev: any) => ({ ...prev, whyRivoreItems: [...prev.whyRivoreItems, { icon: 'Sparkles', title: '', description: '' }] }));
    }
  };
  const updateWhyRivoreItem = (index: number, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      whyRivoreItems: prev.whyRivoreItems.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item)
    }));
  };
  const removeWhyRivoreItem = (index: number) => {
    setSettings((prev: any) => ({ ...prev, whyRivoreItems: prev.whyRivoreItems.filter((_: any, i: number) => i !== index) }));
  };

  // Best Sellers helpers
  const addBestSellerItem = () => {
    setSettings((prev: any) => ({ ...prev, bestSellerSliderItems: [...prev.bestSellerSliderItems, { image: '', productId: '', title: '' }] }));
  };
  const updateBestSellerItem = (index: number, field: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      bestSellerSliderItems: prev.bestSellerSliderItems.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item)
    }));
  };
  const removeBestSellerItem = (index: number) => {
    setSettings((prev: any) => ({ ...prev, bestSellerSliderItems: prev.bestSellerSliderItems.filter((_: any, i: number) => i !== index) }));
  };
  const handleBestSellerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        updateBestSellerItem(index, 'image', data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  if (loading) {
    return <Loader size="lg" fullScreen />;
  }

  // Image upload card component
  const ImageUploadCard = ({ label, value, field, uploading, setUploading, inputRef, dark = false, aspect = 'aspect-video' }: any) => (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-3">{label}</label>
      <div className={`${dark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-border'} rounded-2xl border p-6 flex flex-col items-center gap-4`}>
        {value ? (
          <div className="relative group">
            <img src={value} alt={label} className={`${aspect === 'aspect-square' ? 'h-20 w-20 object-cover rounded-xl' : 'h-16 w-auto object-contain'}`} referrerPolicy="no-referrer" />
            <button type="button" onClick={() => setSettings((prev: any) => ({ ...prev, [field]: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className={`text-xs ${dark ? 'text-white/40' : 'text-muted-foreground'}`}>No image uploaded</div>
        )}
        <div
          onClick={() => inputRef.current?.click()}
          className={`w-full h-14 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${dark ? 'border-white/20 hover:border-white/40' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
        >
          {uploading ? (
            <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${dark ? 'border-white' : 'border-primary'}`}></div>
          ) : (
            <>
              <Upload className={`w-4 h-4 mr-2 ${dark ? 'text-white/40' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${dark ? 'text-white/40' : 'text-muted-foreground'}`}>Upload</span>
            </>
          )}
        </div>
        <input type="file" ref={inputRef} onChange={(e) => handleImageUpload(e, field, setUploading, inputRef)} accept="image/*" className="hidden" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Settings & CMS</h1>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 flex items-center gap-2 text-sm"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-2xl p-1.5 flex flex-wrap gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs uppercase tracking-[0.08em] font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border space-y-8">

        {/* ============ GENERAL ============ */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Meta Pixel ID</label>
                <input type="text" value={settings.metaPixelId} onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="e.g. 123456789012345" />
                <p className="text-xs text-muted-foreground mt-2">Enter your Meta Pixel ID to enable tracking for PageView, AddToCart, and Purchase events.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Store Name</label>
                <input type="text" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Shipping Charge (৳)</label>
                <input type="number" min="0" value={settings.shippingCharge} onChange={(e) => setSettings({ ...settings, shippingCharge: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="e.g. 100 for inside city, or 0 for free shipping" />
                <p className="text-xs text-muted-foreground mt-2">Enter 0 for Free Shipping.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Contact Email</label>
                  <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Contact Phone</label>
                  <input type="tel" value={settings.contactPhone} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ BRANDING ============ */}
        {activeTab === 'branding' && (
          <div className="space-y-8">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Branding</h2>
            <p className="text-sm text-muted-foreground">Upload dark and white versions of your logo. The dark logo shows on light backgrounds, and the white logo on dark backgrounds.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadCard label="Dark Logo (for light backgrounds)" value={settings.logoDark} field="logoDark" uploading={uploadingLogoDark} setUploading={setUploadingLogoDark} inputRef={logoDarkRef} />
              <ImageUploadCard label="White Logo (for dark backgrounds)" value={settings.logoWhite} field="logoWhite" uploading={uploadingLogoWhite} setUploading={setUploadingLogoWhite} inputRef={logoWhiteRef} dark />
            </div>

            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4 pb-3 border-b border-border">Global Fallback Images</h3>
              <p className="text-sm text-muted-foreground mb-4">Fallback images used when a specific product doesn't have an override.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadCard label="Global Fragrance Notes Image" value={settings.fragranceNotesImage} field="fragranceNotesImage" uploading={uploadingNotesImg} setUploading={setUploadingNotesImg} inputRef={notesImgRef} aspect="aspect-square" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4 pb-3 border-b border-border">Homepage Hero Images (Carousel)</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload multiple background images for the hero section carousel.</p>
              <div className="flex flex-wrap gap-4 items-end">
                {settings.heroImages?.map((img: string, idx: number) => (
                  <div key={idx} className="relative w-64 h-36 rounded-2xl overflow-hidden border border-border group shadow-sm">
                    <img src={img} alt={`Hero Background ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button type="button" onClick={() => removeArrayImage('heroImages', idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {(!settings.heroImages || settings.heroImages.length < 10) && (
                  <>
                    <div onClick={() => heroImgRef.current?.click()} className="w-64 h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors shrink-0">
                      {uploadingHeroImg ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div> : <><Upload className="w-6 h-6 text-muted-foreground mb-2" /><span className="text-xs text-muted-foreground font-medium">Upload Images</span></>}
                    </div>
                    <input type="file" ref={heroImgRef} multiple onChange={(e) => handleMultiImageUpload(e, 'heroImages', setUploadingHeroImg, heroImgRef)} accept="image/*" className="hidden" />
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-4 pb-3 border-b border-border">Combo Section Image</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload a single image for the Combo Highlights section on the homepage.</p>
              <div className="flex flex-wrap gap-4 items-end">
                {settings.comboSectionImage && (
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-border group shadow-sm">
                    <img src={settings.comboSectionImage} alt="Combo Section" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button type="button" onClick={() => setSettings((prev: any) => ({ ...prev, comboSectionImage: '' }))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <div onClick={() => comboImgRef.current?.click()} className="w-48 h-48 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                  {uploadingComboImg ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div> : <><Upload className="w-6 h-6 text-muted-foreground mb-2" /><span className="text-xs text-muted-foreground font-medium">Upload Image</span></>}
                </div>
                <input type="file" ref={comboImgRef} onChange={(e) => handleImageUpload(e, 'comboSectionImage', setUploadingComboImg, comboImgRef)} accept="image/*" className="hidden" />
              </div>
            </div>
          </div>
        )}

        {/* ============ HOMEPAGE CMS ============ */}
        {activeTab === 'homepage' && (
          <div className="space-y-10">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Homepage Content Management</h2>

            {/* Hero Text */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-1">Hero Section Text</h3>
                  <p className="text-sm text-muted-foreground">Customize the text and button overlay for the hero section. Leave empty to show only the image cleanly.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-6 rounded-2xl border border-border">
                <div className="col-span-full flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Heading</label>
                    <input type="text" value={settings.heroHeading || ''} onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })} placeholder="e.g. Smell Unforgettable." className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                  </div>
                  <div className="w-24 shrink-0">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Color</label>
                    <input type="color" value={settings.heroHeadingColor || '#111111'} onChange={(e) => setSettings({ ...settings, heroHeadingColor: e.target.value })} className="w-full h-[46px] rounded-xl border border-border cursor-pointer p-1" />
                  </div>
                </div>
                <div className="col-span-full flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Subheading</label>
                    <textarea rows={2} value={settings.heroSubheading || ''} onChange={(e) => setSettings({ ...settings, heroSubheading: e.target.value })} placeholder="Brief description text..." className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div className="w-24 shrink-0">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Color</label>
                    <input type="color" value={settings.heroSubheadingColor || '#333333'} onChange={(e) => setSettings({ ...settings, heroSubheadingColor: e.target.value })} className="w-full h-[46px] rounded-xl border border-border cursor-pointer p-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Button Text</label>
                  <input type="text" value={settings.heroButtonText || ''} onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })} placeholder="e.g. Shop Now" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Button Link</label>
                  <input type="text" value={settings.heroButtonLink || ''} onChange={(e) => setSettings({ ...settings, heroButtonLink: e.target.value })} placeholder="e.g. /shop" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Button Background Color</label>
                  <input type="color" value={settings.heroButtonBgColor || '#111111'} onChange={(e) => setSettings({ ...settings, heroButtonBgColor: e.target.value })} className="w-full h-[46px] rounded-xl border border-border cursor-pointer p-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Button Text Color</label>
                  <input type="color" value={settings.heroButtonTextColor || '#ffffff'} onChange={(e) => setSettings({ ...settings, heroButtonTextColor: e.target.value })} className="w-full h-[46px] rounded-xl border border-border cursor-pointer p-1" />
                </div>
              </div>
            </div>

            {/* Notification Banner */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-semibold text-foreground">Notification Banner</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-muted-foreground font-medium">{settings.bannerEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button
                    type="button"
                    onClick={() => setSettings((prev: any) => ({ ...prev, bannerEnabled: !prev.bannerEnabled }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${settings.bannerEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.bannerEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </label>
              </div>
              <div className="space-y-3 mb-4">
                {settings.bannerMessages.map((msg: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 px-4 py-3 rounded-xl border border-border">
                    <span className="flex-1 text-sm">{msg}</span>
                    <button type="button" onClick={() => removeBannerMsg(i)} className="text-red-500 hover:text-red-700 shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newBannerMsg} onChange={(e) => setNewBannerMsg(e.target.value)} placeholder="New banner message..." className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBannerMsg())} />
                <button type="button" onClick={addBannerMsg} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-1 text-sm"><Plus className="w-4 h-4" /> Add</button>
              </div>
            </div>

            {/* Signature Collection */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">Signature Collection</h3>
              <p className="text-sm text-muted-foreground mb-4">Select up to 6 products to showcase in the Signature Collection slideshow on the homepage.</p>
              <div className="space-y-4">
                {settings.signatureProducts.map((sp: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Product</label>
                      <select
                        value={sp.productId}
                        onChange={(e) => updateSignatureProduct(i, 'productId', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm bg-background"
                      >
                        <option value="">Select a product</option>
                        {allProducts.map((p: any) => (
                          <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tagline</label>
                      <input type="text" value={sp.tagline} onChange={(e) => updateSignatureProduct(i, 'tagline', e.target.value)} placeholder="e.g. The Essence of Spring" className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm" />
                    </div>
                    <button type="button" onClick={() => removeSignatureProduct(i)} className="text-red-500 hover:text-red-700 self-end sm:self-center p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              {settings.signatureProducts.length < 6 && (
                <button type="button" onClick={addSignatureProduct} className="mt-4 bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm border border-border">
                  <Plus className="w-4 h-4" /> Add Signature Product
                </button>
              )}
            </div>

            {/* Best Sellers Slider CMS */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">Best Sellers Slider</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload custom slides for the Weekly Best Sellers section. This replaces the default 8 products auto-pulled algorithm.</p>
              <div className="space-y-4">
                {settings.bestSellerSliderItems.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="shrink-0 flex items-center justify-center">
                      <label className="cursor-pointer group relative block w-20 h-28 rounded-lg overflow-hidden border border-border bg-white shadow-sm flex items-center justify-center">
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBestSellerImageUpload(e, i)} />
                        {item.image ? (
                          <img src={item.image} alt="Slider item" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                        ) : (
                          <div className="text-center p-2 flex flex-col items-center">
                            <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">Upload</span>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Link Buy Now to Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateBestSellerItem(i, 'productId', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm bg-background"
                        >
                          <option value="">Select a product</option>
                          {allProducts.map((p: any) => (
                            <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Custom Title Override (Optional)</label>
                        <input type="text" value={item.title} onChange={(e) => updateBestSellerItem(i, 'title', e.target.value)} placeholder="Will use product name if empty" className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm" />
                      </div>
                    </div>
                    
                    <button type="button" onClick={() => removeBestSellerItem(i)} className="text-red-500 hover:text-red-700 self-end sm:self-center p-2"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addBestSellerItem} className="mt-4 bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm border border-border">
                <Plus className="w-4 h-4" /> Add Best Seller Slide
              </button>
            </div>

            {/* Why Rivore */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">Why Rivore Section</h3>
              <p className="text-sm text-muted-foreground mb-4">Add up to 6 highlighted features shown in the "Why Rivore" section on the homepage.</p>
              <div className="space-y-4">
                {settings.whyRivoreItems.map((item: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-3 bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="w-full sm:w-40">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Icon</label>
                      <select
                        value={item.icon}
                        onChange={(e) => updateWhyRivoreItem(i, 'icon', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm bg-background"
                      >
                        {ICON_OPTIONS.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Title</label>
                      <input type="text" value={item.title} onChange={(e) => updateWhyRivoreItem(i, 'title', e.target.value)} placeholder="e.g. Long Lasting" className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
                      <input type="text" value={item.description} onChange={(e) => updateWhyRivoreItem(i, 'description', e.target.value)} placeholder="Short description..." className="w-full px-3 py-2.5 rounded-lg border border-border outline-none text-sm" />
                    </div>
                    <button type="button" onClick={() => removeWhyRivoreItem(i)} className="text-red-500 hover:text-red-700 self-end sm:self-center p-2"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              {settings.whyRivoreItems.length < 6 && (
                <button type="button" onClick={addWhyRivoreItem} className="mt-4 bg-muted text-foreground px-4 py-2.5 rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm border border-border">
                  <Plus className="w-4 h-4" /> Add Feature
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============ STORE LOCATION ============ */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Store Location</h2>
            <p className="text-sm text-muted-foreground mb-2">Configure the physical store details shown on the homepage.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Store Name</label>
                <input type="text" value={settings.storeLocationName} onChange={(e) => setSettings({ ...settings, storeLocationName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="RIVORÉ Flagship Store" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Address (use line breaks for formatting)</label>
                <textarea value={settings.storeLocationAddress} onChange={(e) => setSettings({ ...settings, storeLocationAddress: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none" rows={3} placeholder="House 50, Road 11&#10;Block F, Banani&#10;Dhaka 1213, Bangladesh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Opening Hours</label>
                <input type="text" value={settings.storeLocationHours} onChange={(e) => setSettings({ ...settings, storeLocationHours: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="11:00 AM - 9:00 PM (Everyday)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">"View on Map" Link URL</label>
                <input type="url" value={settings.storeLocationMapUrl} onChange={(e) => setSettings({ ...settings, storeLocationMapUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="https://maps.google.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-3">Store Image (transparent background recommended)</label>
                <div className="flex flex-wrap gap-4 items-end">
                  {settings.storeLocationImage && (
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-border group shadow-sm bg-[#f8f5ff]">
                      <img src={settings.storeLocationImage} alt="Store" className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
                      <button type="button" onClick={() => setSettings((prev: any) => ({ ...prev, storeLocationImage: '' }))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                  <div onClick={() => storeImgRef.current?.click()} className="w-48 h-48 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                    {uploadingStoreImg ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div> : <><Upload className="w-6 h-6 text-muted-foreground mb-2" /><span className="text-xs text-muted-foreground font-medium">Upload Store Image</span></>}
                  </div>
                  <input type="file" ref={storeImgRef} onChange={(e) => handleImageUpload(e, 'storeLocationImage', setUploadingStoreImg, storeImgRef)} accept="image/*" className="hidden" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ CONTACT PAGE ============ */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Contact Page</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Google Maps Embed URL</label>
                <input type="url" value={settings.contactMapEmbedUrl} onChange={(e) => setSettings({ ...settings, contactMapEmbedUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all text-xs font-mono" placeholder="https://www.google.com/maps/embed?pb=..." />
                <p className="text-xs text-muted-foreground mt-2">Go to Google Maps → Share → Embed a map → copy the src URL from the iframe code.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Customer Service Email</label>
                  <input type="email" value={settings.contactServiceEmail} onChange={(e) => setSettings({ ...settings, contactServiceEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="support@rivore.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Customer Service Phone</label>
                  <input type="tel" value={settings.contactServicePhone} onChange={(e) => setSettings({ ...settings, contactServicePhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="+880 1XXX-XXXXXX" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Headquarters Address (line breaks for formatting)</label>
                <textarea value={settings.contactHeadquartersAddress} onChange={(e) => setSettings({ ...settings, contactHeadquartersAddress: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none" rows={3} placeholder="123 Fragrance Lane&#10;New York, NY 10001" />
              </div>
            </div>
          </div>
        )}

        {/* ============ CATEGORIES & FILTERS ============ */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6 pb-4 border-b border-border">Categories</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.categories.map((cat: string) => (
                    <div key={cat} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm">
                      <span>{cat}</span>
                      <button type="button" onClick={() => removeCategory(cat)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New Category Name" className="flex-1 px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())} />
                  <button type="button" onClick={addCategory} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-6 pb-4 border-b border-border">Product Filters</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  {settings.filters.map((filter: any, index: number) => (
                    <div key={index} className="flex items-start justify-between bg-muted/30 p-4 rounded-xl border border-border">
                      <div>
                        <h3 className="font-medium text-foreground">{filter.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Options: {filter.options.join(', ')}</p>
                      </div>
                      <button type="button" onClick={() => removeFilter(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
                <div className="bg-muted/10 p-4 rounded-xl border border-border space-y-4">
                  <h3 className="font-medium text-foreground">Add New Filter</h3>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Filter Name (e.g., Size, Scent)</label>
                    <input type="text" value={newFilterName} onChange={(e) => setNewFilterName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Options (comma separated)</label>
                    <input type="text" value={newFilterOptions} onChange={(e) => setNewFilterOptions(e.target.value)} placeholder="e.g., 50ml, 100ml, 200ml" className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none" />
                  </div>
                  <button type="button" onClick={addFilter} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Add Filter</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ INVOICE ============ */}
        {activeTab === 'invoice' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Invoice Settings</h2>
            <p className="text-sm text-muted-foreground mb-2">Customize the information printed on your A4 invoices and POS receipts.</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Company Name</label>
                  <input type="text" value={settings.invoiceCompanyName} onChange={(e) => setSettings({ ...settings, invoiceCompanyName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Rivoré" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Company Address</label>
                  <input type="text" value={settings.invoiceAddress} onChange={(e) => setSettings({ ...settings, invoiceAddress: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Dhaka, Bangladesh" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Invoice Phone</label>
                  <input type="tel" value={settings.invoicePhone} onChange={(e) => setSettings({ ...settings, invoicePhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="+880 1XXX-XXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Invoice Email</label>
                  <input type="email" value={settings.invoiceEmail} onChange={(e) => setSettings({ ...settings, invoiceEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="contact@rivore.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Invoice Footer Message</label>
                <textarea value={settings.invoiceFooter} onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none" rows={2} placeholder="Thank you for choosing Rivoré." />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Invoice Logo URL</label>
                <input type="url" value={settings.invoiceLogo} onChange={(e) => setSettings({ ...settings, invoiceLogo: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="https://..." />
                {settings.invoiceLogo && (
                  <div className="mt-3 p-4 bg-muted/50 rounded-xl border border-border inline-block">
                    <img src={settings.invoiceLogo} alt="Invoice Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ PAYMENT GATEWAYS ============ */}
        {activeTab === 'payment' && (
          <div className="space-y-8">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Payment Gateways</h2>
            <p className="text-sm text-muted-foreground">Configure your payment gateway credentials. Enable gateways to offer online payment during checkout.</p>

            {/* bKash */}
            <div className="bg-[#E2136E]/5 p-6 rounded-2xl border border-[#E2136E]/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E2136E] rounded-xl flex items-center justify-center text-white font-bold text-sm">bK</div>
                  <h3 className="text-lg font-semibold text-foreground">bKash Merchant</h3>
                </div>
                <button type="button" onClick={() => setSettings((prev: any) => ({ ...prev, paymentBkash: { ...prev.paymentBkash, enabled: !prev.paymentBkash.enabled } }))} className={`relative w-11 h-6 rounded-full transition-colors ${settings.paymentBkash.enabled ? 'bg-[#E2136E]' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.paymentBkash.enabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
              {settings.paymentBkash.enabled && (
                <div className="space-y-3 mt-4">
                  <input type="text" value={settings.paymentBkash.merchantId} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentBkash: { ...prev.paymentBkash, merchantId: e.target.value } }))} placeholder="Merchant Wallet Number" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#E2136E]/30 outline-none text-sm" />
                  <input type="text" value={settings.paymentBkash.apiKey} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentBkash: { ...prev.paymentBkash, apiKey: e.target.value } }))} placeholder="API Key (App Key)" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#E2136E]/30 outline-none text-sm" />
                  <input type="password" value={settings.paymentBkash.apiSecret} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentBkash: { ...prev.paymentBkash, apiSecret: e.target.value } }))} placeholder="API Secret (App Secret)" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-[#E2136E]/30 outline-none text-sm" />
                </div>
              )}
            </div>

            {/* SSLCommerz */}
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-200/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">SSL</div>
                  <h3 className="text-lg font-semibold text-foreground">SSLCommerz</h3>
                </div>
                <button type="button" onClick={() => setSettings((prev: any) => ({ ...prev, paymentSslCommerz: { ...prev.paymentSslCommerz, enabled: !prev.paymentSslCommerz.enabled } }))} className={`relative w-11 h-6 rounded-full transition-colors ${settings.paymentSslCommerz.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.paymentSslCommerz.enabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
              {settings.paymentSslCommerz.enabled && (
                <div className="space-y-3 mt-4">
                  <input type="text" value={settings.paymentSslCommerz.storeId} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentSslCommerz: { ...prev.paymentSslCommerz, storeId: e.target.value } }))} placeholder="Store ID" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/30 outline-none text-sm" />
                  <input type="password" value={settings.paymentSslCommerz.storePassword} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentSslCommerz: { ...prev.paymentSslCommerz, storePassword: e.target.value } }))} placeholder="Store Password" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-blue-500/30 outline-none text-sm" />
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input type="checkbox" checked={settings.paymentSslCommerz.isLive} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentSslCommerz: { ...prev.paymentSslCommerz, isLive: e.target.checked } }))} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm text-foreground font-medium">Live Mode</span>
                    <span className="text-xs text-muted-foreground">(uncheck for sandbox/testing)</span>
                  </label>
                </div>
              )}
            </div>

            {/* UddoktaPay */}
            <div className="bg-green-50/50 p-6 rounded-2xl border border-green-200/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">UP</div>
                  <h3 className="text-lg font-semibold text-foreground">UddoktaPay</h3>
                </div>
                <button type="button" onClick={() => setSettings((prev: any) => ({ ...prev, paymentUddoktaPay: { ...prev.paymentUddoktaPay, enabled: !prev.paymentUddoktaPay.enabled } }))} className={`relative w-11 h-6 rounded-full transition-colors ${settings.paymentUddoktaPay.enabled ? 'bg-green-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${settings.paymentUddoktaPay.enabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
              {settings.paymentUddoktaPay.enabled && (
                <div className="space-y-3 mt-4">
                  <input type="text" value={settings.paymentUddoktaPay.apiKey} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentUddoktaPay: { ...prev.paymentUddoktaPay, apiKey: e.target.value } }))} placeholder="API Key" className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-500/30 outline-none text-sm" />
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input type="checkbox" checked={settings.paymentUddoktaPay.isLive} onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentUddoktaPay: { ...prev.paymentUddoktaPay, isLive: e.target.checked } }))} className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-foreground font-medium">Live Mode</span>
                    <span className="text-xs text-muted-foreground">(uncheck for sandbox/testing)</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ DELIVERY SETTINGS ============ */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Delivery Settings</h2>
            <p className="text-sm text-muted-foreground mb-6">Configure Steadfast Courier integration for automated order dispatch.</p>
            
            <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-200/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Steadfast Courier</h3>
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${settings.deliverySteadfast.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                       <span className="text-xs text-muted-foreground font-medium">{settings.deliverySteadfast.enabled ? 'Connected' : 'Disconnected'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSettings((prev: any) => ({ ...prev, deliverySteadfast: { ...prev.deliverySteadfast, enabled: !prev.deliverySteadfast.enabled } }))} 
                  className={`relative w-12 h-6.5 rounded-full transition-colors ${settings.deliverySteadfast.enabled ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full transition-transform shadow ${settings.deliverySteadfast.enabled ? 'translate-x-5.5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              {settings.deliverySteadfast.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl border border-purple-100 mb-2">
                    <input 
                      type="checkbox" 
                      id="autoSend"
                      checked={settings.deliverySteadfast.autoSend} 
                      onChange={(e) => setSettings((prev: any) => ({ ...prev, deliverySteadfast: { ...prev.deliverySteadfast, autoSend: e.target.checked } }))} 
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                    <label htmlFor="autoSend" className="text-sm font-medium text-foreground cursor-pointer select-none">Auto Send orders to courier after creation</label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider ml-1">API Key</label>
                      <input 
                        type="text" 
                        value={settings.deliverySteadfast.apiKey} 
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, deliverySteadfast: { ...prev.deliverySteadfast, apiKey: e.target.value } }))} 
                        placeholder="Enter API Key" 
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-purple-500/30 outline-none text-sm transition-all shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider ml-1">Secret Key</label>
                      <input 
                        type="password" 
                        value={settings.deliverySteadfast.secretKey} 
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, deliverySteadfast: { ...prev.deliverySteadfast, secretKey: e.target.value } }))} 
                        placeholder="Enter Secret Key" 
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-purple-500/30 outline-none text-sm transition-all shadow-sm" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider ml-1">Base URL</label>
                      <input 
                        type="text" 
                        value={settings.deliverySteadfast.baseUrl} 
                        onChange={(e) => setSettings((prev: any) => ({ ...prev, deliverySteadfast: { ...prev.deliverySteadfast, baseUrl: e.target.value } }))} 
                        placeholder="https://portal.packzy.com/api/v1" 
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-purple-500/30 outline-none text-sm transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============ SOCIAL LINKS ============ */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-semibold text-foreground pb-4 border-b border-border">Social Links</h2>
            <p className="text-sm text-muted-foreground mb-2">Add your social media profile URLs. These will appear in the website footer.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Facebook Page URL</label>
                <input type="url" value={settings.socialFacebook} onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="https://facebook.com/rivore" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Instagram Profile URL</label>
                <input type="url" value={settings.socialInstagram} onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="https://instagram.com/rivore" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">TikTok Profile URL</label>
                <input type="url" value={settings.socialTiktok} onChange={(e) => setSettings({ ...settings, socialTiktok: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="https://tiktok.com/@rivore" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp Number/Link</label>
                <input type="url" value={settings.socialWhatsapp} onChange={(e) => setSettings({ ...settings, socialWhatsapp: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="https://wa.me/8801XXXXXXXXX" />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="pt-6 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center min-w-[150px] gap-2"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
