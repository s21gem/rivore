import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Image as ImageIcon, Video, Link as LinkIcon, Save, MoveUp, MoveDown, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';

const getVideoEmbedUrl = (url: string) => {
  if (!url) return { url: null, isIframe: false };
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (match) return { url: `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&controls=0`, isIframe: true };
  const vMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vMatch) return { url: `https://player.vimeo.com/video/${vMatch[1]}?background=1&autoplay=1&loop=1&muted=1`, isIframe: true };
  const tMatch = url.match(/video\/(\d+)/);
  if (tMatch) return { url: `https://www.tiktok.com/embed/v2/${tMatch[1]}`, isIframe: true };
  const gMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gMatch) return { url: `https://drive.google.com/file/d/${gMatch[1]}/preview`, isIframe: true };
  return { url: url, isIframe: false }; // Fallback for direct MP4/WebM URLs
};

export default function HeroMediaManager() {
  const { token, logout } = useAuthStore();
  const activeToken = token || localStorage.getItem('token');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/heroMedia', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (error) {
      toast.error('Failed to load hero media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSave = async (media: any) => {
    try {
      // Sync legacy fields
      media.title = media.headline !== undefined ? media.headline : media.title;
      media.subtitle = media.subheadline !== undefined ? media.subheadline : media.subtitle;
      media.buttonText = media.ctaText !== undefined ? media.ctaText : media.buttonText;
      media.buttonLink = media.ctaLink !== undefined ? media.ctaLink : media.buttonLink;
      
      // Default to type 'image' unless video exists
      if (media.videoFile) media.type = 'video_upload';
      else if (media.videoUrl) media.type = 'video_url';
      else media.type = 'image';

      const isNew = !media._id;
      const url = isNew ? '/api/heroMedia' : `/api/heroMedia/${media._id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify(media)
      });

      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }

      if (res.ok) {
        toast.success(isNew ? 'Slide created' : 'Slide updated');
        setIsEditing(null);
        fetchMedia();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      const res = await fetch(`/api/heroMedia/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchMedia();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${activeToken}` },
        body: formData
      });
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setIsEditing({ ...isEditing, [field]: data.url });
        toast.success('Upload complete');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === mediaList.length - 1) return;

    const newList = [...mediaList];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap sortOrder
    const tempSort = newList[index].sortOrder;
    newList[index].sortOrder = newList[swapIndex].sortOrder;
    newList[swapIndex].sortOrder = tempSort;
    
    // Swap array position for immediate UI feedback
    const temp = newList[index];
    newList[index] = newList[swapIndex];
    newList[swapIndex] = temp;
    
    setMediaList(newList);

    // Save to DB
    try {
      const res = await fetch('/api/heroMedia/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          items: [
            { id: newList[index]._id, sortOrder: newList[index].sortOrder },
            { id: newList[swapIndex]._id, sortOrder: newList[swapIndex].sortOrder }
          ]
        })
      });
      if (res.status === 401) {
        logout();
        window.location.href = '/admin/login';
        return;
      }
    } catch (error) {
      toast.error('Failed to reorder in database');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif">Hero Media Manager</h1>
          <p className="text-muted-foreground mt-1">Manage homepage carousel images and videos.</p>
        </div>
        <button
          onClick={() => setIsEditing({ 
            type: 'image', isActive: true, sortOrder: mediaList.length, autoplay: true, loop: true, muted: true, controls: false,
            desktopImageUrl: '', mobileImageUrl: '', videoFile: '', videoUrl: '',
            headline: '', subheadline: '', ctaText: '', ctaLink: ''
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Slide
        </button>
      </div>

      {isEditing ? (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-serif mb-6">{isEditing._id ? 'Edit Slide' : 'Create New Slide'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="mb-3 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-bold text-blue-900">⚠️ New Unified Hero:</span> You can now upload both an image and a video. The image will act as a lightning-fast poster before the video loads.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Desktop Image (Required) <span className="text-xs text-muted-foreground">Acts as fallback/poster</span></label>
                <div className="flex gap-2">
                  <input type="text" value={isEditing.desktopImageUrl !== undefined ? isEditing.desktopImageUrl : (isEditing.mediaUrl || '')} onChange={(e) => setIsEditing({ ...isEditing, desktopImageUrl: e.target.value })} className="flex-1 bg-background border border-input rounded-md px-3 py-2" placeholder="Image URL" />
                  <label className="bg-muted px-4 py-2 rounded-md border border-input cursor-pointer hover:bg-muted/80 flex items-center">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'desktopImageUrl')} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mobile Image (Optional) <span className="text-xs text-muted-foreground">Optimized for phones</span></label>
                <div className="flex gap-2">
                  <input type="text" value={isEditing.mobileImageUrl !== undefined ? isEditing.mobileImageUrl : (isEditing.thumbnail || '')} onChange={(e) => setIsEditing({ ...isEditing, mobileImageUrl: e.target.value })} className="flex-1 bg-background border border-input rounded-md px-3 py-2" placeholder="Mobile Image URL" />
                  <label className="bg-muted px-4 py-2 rounded-md border border-input cursor-pointer hover:bg-muted/80 flex items-center">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'mobileImageUrl')} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium mb-1">Video Upload (Optional)</label>
                <div className="flex gap-2">
                  <input type="text" value={isEditing.videoFile || ''} onChange={(e) => setIsEditing({ ...isEditing, videoFile: e.target.value })} className="flex-1 bg-background border border-input rounded-md px-3 py-2" placeholder="Video URL" />
                  <label className="bg-muted px-4 py-2 rounded-md border border-input cursor-pointer hover:bg-muted/80 flex items-center">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoFile')} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Video URL (YouTube, Vimeo, Google Drive)</label>
                <input type="text" value={isEditing.videoUrl || ''} onChange={(e) => setIsEditing({ ...isEditing, videoUrl: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2" placeholder="https://youtube.com/watch?v=..." />
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-medium">Overlay Content (Optional)</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Headline</label>
                  <input type="text" value={isEditing.headline !== undefined ? isEditing.headline : (isEditing.title || '')} onChange={(e) => setIsEditing({ ...isEditing, headline: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2" placeholder="e.g. The New Collection" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subheadline</label>
                  <input type="text" value={isEditing.subheadline !== undefined ? isEditing.subheadline : (isEditing.subtitle || '')} onChange={(e) => setIsEditing({ ...isEditing, subheadline: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2" placeholder="e.g. Discover the essence of luxury." />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <input type="text" value={isEditing.ctaText !== undefined ? isEditing.ctaText : (isEditing.buttonText || '')} onChange={(e) => setIsEditing({ ...isEditing, ctaText: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2" placeholder="e.g. Shop Now" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Button Link</label>
                    <input type="text" value={isEditing.ctaLink !== undefined ? isEditing.ctaLink : (isEditing.buttonLink || '')} onChange={(e) => setIsEditing({ ...isEditing, ctaLink: e.target.value })} className="w-full bg-background border border-input rounded-md px-3 py-2" placeholder="e.g. /shop" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Preview</h4>
              <div className="aspect-[16/9] bg-black rounded-xl overflow-hidden relative border border-border">
                {/* Fallback Image */}
                {(isEditing.desktopImageUrl || isEditing.mediaUrl) && (
                  <img src={isEditing.desktopImageUrl || isEditing.mediaUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                )}
                
                {/* Video Layer */}
                {(isEditing.videoFile || isEditing.videoUrl) && (
                  <div className="absolute inset-0 w-full h-full">
                    {isEditing.videoFile ? (
                      <video src={isEditing.videoFile} autoPlay={isEditing.autoplay} loop={isEditing.loop} muted={isEditing.muted} className="w-full h-full object-cover" />
                    ) : (
                      (() => {
                        const embed = getVideoEmbedUrl(isEditing.videoUrl);
                        if (!embed.url) return (
                          <div className="w-full h-full flex items-center justify-center bg-black/80 text-white flex-col gap-2 relative z-20">
                            <LinkIcon className="w-8 h-8 opacity-50" />
                            <span className="text-sm opacity-50">Invalid or Unsupported Video URL</span>
                          </div>
                        );
                        if (embed.isIframe) {
                          return (
                            <div className="w-full h-full pointer-events-none overflow-hidden scale-[1.3] relative z-10">
                              <iframe src={embed.url} className="w-full h-full" allow="autoplay; fullscreen" frameBorder="0" />
                            </div>
                          );
                        } else {
                          return <video src={embed.url} autoPlay={isEditing.autoplay} loop={isEditing.loop} muted={isEditing.muted} playsInline className="w-full h-full object-cover relative z-10" />;
                        }
                      })()
                    )}
                  </div>
                )}
                
                {/* Overlay Preview */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 text-white z-30">
                  {(isEditing.headline || isEditing.title) && <h3 className="text-2xl font-serif font-bold mb-1">{isEditing.headline || isEditing.title}</h3>}
                  {(isEditing.subheadline || isEditing.subtitle) && <p className="text-sm opacity-80 mb-4">{isEditing.subheadline || isEditing.subtitle}</p>}
                  {(isEditing.ctaText || isEditing.buttonText) && <div className="bg-white text-black px-6 py-2 rounded-md font-medium inline-block self-start text-sm">{isEditing.ctaText || isEditing.buttonText}</div>}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-xl mt-4">
                <h4 className="font-medium mb-3">Video Settings</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isEditing.autoplay} onChange={(e) => setIsEditing({ ...isEditing, autoplay: e.target.checked })} /> Autoplay
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isEditing.loop} onChange={(e) => setIsEditing({ ...isEditing, loop: e.target.checked })} /> Loop
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isEditing.muted} onChange={(e) => setIsEditing({ ...isEditing, muted: e.target.checked })} /> Muted
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isEditing.controls} onChange={(e) => setIsEditing({ ...isEditing, controls: e.target.checked })} /> Show Controls
                    </label>
                  </div>
                </div>
              <div className="bg-muted p-4 rounded-xl mt-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input type="checkbox" checked={isEditing.isActive} onChange={(e) => setIsEditing({ ...isEditing, isActive: e.target.checked })} className="w-4 h-4" /> 
                  Slide is Active (Visible on homepage)
                </label>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <button onClick={() => setIsEditing(null)} className="px-4 py-2 rounded border hover:bg-muted transition-colors">Cancel</button>
            <button onClick={() => handleSave(isEditing)} className="bg-primary text-primary-foreground px-6 py-2 rounded flex items-center gap-2 hover:bg-primary/90"><Save className="w-4 h-4"/> Save Slide</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {mediaList.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground">No hero media found. Create your first slide!</div>
          ) : (
            mediaList.map((media, index) => (
              <div key={media._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-6 shadow-sm">
                <div className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                  {(media.desktopImageUrl || media.mediaUrl) && <img src={media.desktopImageUrl || media.mediaUrl} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover z-0" />}
                  {(media.videoFile || media.videoUrl) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                      <Video className="text-white opacity-80 w-6 h-6"/>
                    </div>
                  )}
                  {!media.isActive && <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider">Hidden</div>}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-wider font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
                      {(media.videoFile || media.videoUrl) ? 'VIDEO & IMAGE' : 'IMAGE ONLY'}
                    </span>
                  </div>
                  {(media.headline || media.title) && <h3 className="font-serif font-bold text-lg">{media.headline || media.title}</h3>}
                  <p className="text-xs text-muted-foreground truncate max-w-md">{media.desktopImageUrl || media.mediaUrl}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 hover:bg-muted rounded disabled:opacity-30"><MoveUp className="w-4 h-4"/></button>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === mediaList.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-30"><MoveDown className="w-4 h-4"/></button>
                </div>

                <div className="flex gap-2 border-l border-border pl-6">
                  <button onClick={() => setIsEditing(media)} className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground transition-colors rounded text-foreground"><Edit className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(media._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
