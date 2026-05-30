import { useRef, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const CloudinaryImageField = ({ value, onChange }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 sm:col-span-2 lg:col-span-3">
      <label className="block text-sm font-medium text-neutral-700">
        Item image <span className="text-red-500">*</span>
      </label>

      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cream bg-surface px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-white">
        {uploading ? <LoadingSpinner size="sm" /> : '📤 Upload image'}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
          required={!value}
        />
      </label>

      {value && (
        <div className="flex items-start gap-4 rounded-xl border border-cream bg-surface p-3">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-24 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = '';
              e.target.alt = 'Invalid image';
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-neutral-700">Preview</p>
            <p className="mt-1 text-[10px] text-neutral-500">Uploaded image is saved for this item.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageField;

