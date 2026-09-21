import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Star, Plus, Link, AlertCircle, FileImage } from 'lucide-react';
import { toastService } from '../../services/toastService';
import { productService } from '../../services/productService';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  thumbnail: string;
  onThumbnailChange: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  thumbnail,
  onThumbnailChange,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleAquaticImages = [
    { label: 'Red Dragon Guppy', url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Blue Moscow Guppy', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Micro Pellets', url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Aquarium Background Reference', url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1000&q=80' },
  ];

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    if ((images || []).includes(url)) {
      toastService.warning('Duplicate Image', 'This image is already in the product gallery.');
      return;
    }
    const updated = [...(images || []), url];
    onChange(updated);
    if (!thumbnail || images.length === 0) {
      onThumbnailChange(url);
    }
    setUrlInput('');
    toastService.success('Image Added', 'Image successfully added to gallery.');
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toastService.error('Invalid Format', `${file.name} must be JPG, PNG, or WebP.`);
        return;
      }

      // Check size (5MB max)
      const maxBytes = 5 * 1024 * 1024;
      if (file.size > maxBytes) {
        toastService.error('File Too Large', `${file.name} exceeds 5 MB limit. Please compress image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result) {
          try { const uploaded = await productService.uploadImage(result); handleAddImage(uploaded.url); }
          catch (error) { toastService.error('Upload Failed', error instanceof Error ? error.message : `Could not upload ${file.name}.`); }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    const targetUrl = (images || [])[index];
    const updated = (images || []).filter((_, i) => i !== index);
    onChange(updated);
    if (thumbnail === targetUrl) {
      onThumbnailChange(updated[0] || '');
    }
  };

  return (
    <div className="space-y-3 bg-[#F8FDFF] p-4 sm:p-5 rounded-2xl border border-sky-100">
      {/* Header & Dimensions Specification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-[#0875B5]" />
          <label className="text-xs font-bold text-[#032B42] uppercase tracking-wider block">
            Product Imagery &amp; Gallery
          </label>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#0875B5] font-bold bg-sky-100/80 border border-sky-200 px-2 py-0.5 rounded-md">
            Recommended: 1600 × 1600 px (1:1 Square)
          </span>
          <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            Max 5 MB • JPG, PNG, WEBP
          </span>
        </div>
      </div>

      {/* Image Size Guidance Note */}
      <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-3 text-[11px] text-[#064463] flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-[#0875B5] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Image Sizing &amp; Quality Guidelines: </span>
          Use square images (minimum <strong className="font-semibold">800 × 800 px</strong>, recommended <strong className="font-semibold">1600 × 1600 px</strong>) for optimum mobile &amp; retina sharpness. Clean, natural lighting on neutral or planted backgrounds displays guppy fin details with maximum chromatic fidelity.
        </div>
      </div>

      {/* Upload Method Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-100 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
            uploadMode === 'upload'
              ? 'bg-[#0875B5] text-white'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Image File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
            uploadMode === 'url'
              ? 'bg-[#0875B5] text-white'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-sky-100'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          Add via Image URL
        </button>
      </div>

      {/* 1. DIRECT FILE UPLOAD (Drag & Drop + File Picker) */}
      {uploadMode === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#0875B5] bg-sky-100/50 scale-[0.99]'
              : 'border-sky-200 hover:border-[#0875B5] bg-white hover:bg-sky-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0875B5] mx-auto flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#032B42]">
            Click to Browse or Drag &amp; Drop Image Here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Square 1:1 format (1200 × 1200 px), up to 5 MB per file
          </p>
        </div>
      )}

      {/* 2. URL INPUT BAR */}
      {uploadMode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste high-res image URL (e.g. https://images.unsplash.com/...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage(urlInput);
                }
              }}
              className="flex-1 text-xs p-2.5 bg-white border border-sky-200 rounded-xl focus:outline-none focus:border-[#0875B5] text-[#032B42]"
            />
            <button
              type="button"
              onClick={() => handleAddImage(urlInput)}
              className="bg-[#0875B5] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#064463] transition-colors shrink-0"
            >
              Add URL
            </button>
          </div>

          {/* Quick Sample Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 pt-1">
            <span className="font-semibold text-slate-600">Quick Samples:</span>
            {sampleAquaticImages.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => handleAddImage(s.url)}
                className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-[#0875B5] hover:bg-sky-50 transition-colors font-medium"
              >
                + {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Gallery Grid */}
      {(images || []).length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Uploaded Photos ({(images || []).length}):</span>
            <span>Click star on any photo to set as Primary Cover</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(images || []).map((img, idx) => (
              <div
                key={idx}
                className={`relative group aspect-square rounded-xl overflow-hidden border-2 bg-white shadow-xs transition-all ${
                  thumbnail === img ? 'border-[#0875B5] ring-2 ring-[#0875B5]/30' : 'border-sky-100 hover:border-sky-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />

                {/* Thumbnail Indicator / Selector */}
                <button
                  type="button"
                  onClick={() => onThumbnailChange(img)}
                  className={`absolute top-1.5 left-1.5 px-2 py-1 rounded-md shadow-xs text-[10px] font-bold flex items-center gap-1 transition-colors ${
                    thumbnail === img
                      ? 'bg-[#0875B5] text-white'
                      : 'bg-black/60 text-white hover:bg-[#0875B5]'
                  }`}
                  title="Set as Primary Cover Thumbnail"
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>{thumbnail === img ? 'Cover' : 'Set Cover'}</span>
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md transition-opacity"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 text-center">
                  <span className="text-[9px] text-white/90 font-mono">Image #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
