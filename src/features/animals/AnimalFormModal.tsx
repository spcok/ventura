import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Map, X } from 'lucide-react';

export function AnimalFormModal({ initialData, onClose }: { initialData?: any, onClose: () => void }) {
  const [formData, setFormData] = useState(initialData || {});
  const [isCompressing, setIsCompressing] = useState(false);

  // NATIVE HTML5 IMAGE COMPRESSOR & CROPPER
  // Shrinks massive phone photos down to a lightweight 800px JPEG
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Output as compressed JPEG (70% quality)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (err) => reject(err);
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'distribution_map_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file);
      setFormData({ ...formData, [field]: compressedDataUrl });
    } catch (error) {
      console.error("Image compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("To be submitted to Electric Sync:", formData);
    onClose();
  };

  const removeImage = (field: 'image_url' | 'distribution_map_url') => {
    const newData = { ...formData };
    delete newData[field];
    setFormData(newData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#0F1117] border border-slate-800/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
        <div className="sticky top-0 bg-[#0F1117]/90 backdrop-blur border-b border-slate-800/80 p-5 flex justify-between items-center z-20">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">
            {initialData ? 'Edit Clinical Record' : 'Register New Animal'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* MEDIA UPLOAD SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} /> Profile Photo
              </label>
              {formData.image_url ? (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800/80 group">
                  <img src={formData.image_url} alt="Profile" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage('image_url')} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500 text-white rounded-lg backdrop-blur transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 bg-[#0A0B0E] border-2 border-dashed border-slate-800/80 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                  <UploadCloud size={24} className="text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">{isCompressing ? 'Compressing...' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image_url')} disabled={isCompressing} />
                </label>
              )}
            </div>

            {/* Distribution Map */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Map size={14} /> Distribution Map
              </label>
              {formData.distribution_map_url ? (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-800/80 group">
                  <img src={formData.distribution_map_url} alt="Map" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage('distribution_map_url')} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500 text-white rounded-lg backdrop-blur transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 bg-[#0A0B0E] border-2 border-dashed border-slate-800/80 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                  <UploadCloud size={24} className="text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-500">{isCompressing ? 'Compressing...' : 'Upload Map'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'distribution_map_url')} disabled={isCompressing} />
                </label>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-slate-800/80" />

          {/* STANDARD FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Species</label>
              <input type="text" value={formData.species || ''} onChange={e => setFormData({...formData, species: e.target.value})} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
              <select value={formData.category || 'OWLS'} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50">
                <option value="OWLS">Owls</option>
                <option value="RAPTORS">Raptors</option>
                <option value="MAMMALS">Mammals</option>
                <option value="EXOTICS">Exotics</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</label>
              <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ring Number</label>
              <input type="text" value={formData.ring_number || ''} onChange={e => setFormData({...formData, ring_number: e.target.value})} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Microchip ID</label>
              <input type="text" value={formData.microchip_id || ''} onChange={e => setFormData({...formData, microchip_id: e.target.value})} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Husbandry Notes</label>
            <textarea value={formData.critical_husbandry_notes || ''} onChange={e => setFormData({...formData, critical_husbandry_notes: e.target.value})} rows={3} className="w-full bg-[#0A0B0E] border border-slate-800/80 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500/50 resize-none" />
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex justify-end">
            <button type="submit" className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              {initialData ? 'Save Changes' : 'Create Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
