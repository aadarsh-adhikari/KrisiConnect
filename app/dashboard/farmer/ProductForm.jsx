"use client";
import { useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import Image from 'next/image';

const ProductForm = ({ onSave, initial, loading, onCancel }) => {
  const [form, setForm] = useState(
    initial || {
      name: "",
      description: "",
      category: "",
      price: "",
      quantity: "",
      location: "",
      images: [],
    }
  );
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const categoryOptions = [
    "Fruits",
    "Vegetables",
    "Grains & Cereals",
    "Dairy Products",
    "Meat & Poultry",
    "Seeds & Saplings",
    "Farm Tools & Equipment",
    "Organic & Natural Products",
    "Other Food",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageRemove = (img) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((i) => i !== img),
    }));
    setImageFiles((prev) => prev.filter((f) => f.preview !== img));
  };

  const addFiles = (filesArr) => {
    const files = Array.from(filesArr || []);
    const currentCount = form.images.length;
    const maxImages = 7;

    if (currentCount >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const availableSlots = maxImages - currentCount;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(
        `Only ${availableSlots} more image(s) can be added (max ${maxImages} total)`
      );
    }

    const previews = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImageFiles((prev) => [...prev, ...previews]);
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...previews.map((p) => p.preview)],
    }));
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    // allow progress tracking if needed
    try {
      const res = await axios.post("/api/upload", formData);
      return res.data.url;
    } catch (err) {
      // Log server response for debugging and propagate a helpful message
      console.error('Upload API error', err.response?.data || err.message || err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      throw new Error(serverMsg || 'Upload failed');
    }
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.category) return "Category is required";
    if (form.price === "" || Number(form.price) < 0)
      return "Price must be non-negative";
    if (form.quantity === "" || Number(form.quantity) < 0)
      return "Quantity must be non-negative";
    if (!form.location.trim()) return "Location is required";
    if (form.images.length === 0) return "At least one image is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setUploading(true);
    setUploadCount(0);
    try {
      const existing = form.images.filter((img) => img.startsWith("http"));
      const files = imageFiles.map((f) => f.file);
      if (files.length > 0) {
        const uploaded = [];
        for (const file of files) {
          const url = await uploadImage(file);
          uploaded.push(url);
          setUploadCount((c) => c + 1);
        }
        const payload = { ...form, images: [...existing, ...uploaded] };
        await onSave(payload);
      } else {
        await onSave(form);
      }
      setImageFiles([]);
    } catch (err) {
      console.error("Image upload failed", err);
      setError(err?.message || "Failed to upload images");
    } finally {
      setUploading(false);
      setUploadCount(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className=" rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{initial ? 'Edit Product' : 'Add Product'}</h2>
           
          </div>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Name <span className="text-red-500">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g., Fresh Tomatoes"
              className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="">Select Category</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Short details about the product"
              className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 h-32 resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Price (NPR) <span className="text-red-500">*</span></label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Quantity <span className="text-red-500">*</span></label>
                <input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 10"
                  min="0"
                  step="1"
                  className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="City or locality"
                  className="w-full mt-2 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Product Images <span className="text-red-500">*</span></label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-3 p-4 rounded border-2 border-dashed ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4M16 7l-4-4m0 0L8 7m4-4v11" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700">Drag & drop images or <button type="button" onClick={() => inputRef.current?.click()} className="text-green-600 font-semibold underline">browse</button></p>
                    <p className="text-xs text-gray-400">JPEG/PNG recommended. Up to 7 images.</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{form.images.length}/7</div>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative rounded overflow-hidden bg-gray-100 h-24 w-full">
                    <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => handleImageRemove(img)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full hover:bg-white transition" aria-label="Remove image">
                      <FaTimes className="text-red-500" />
                    </button>
                    {/* show uploading badge if uploading and uploadCount <= index of file being uploaded */}
                    {uploading && imageFiles.length > 0 && idx < uploadCount && (
                      <div className="absolute bottom-1 left-1 text-xs bg-white/90 px-2 py-1 rounded text-green-600 font-medium">Uploaded</div>
                    )}
                  </div>
                ))}
              </div>

              {uploading && imageFiles.length > 0 && (
                <div className="mt-4">
                  <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${Math.round((uploadCount / (imageFiles.length || 1)) * 100)}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Uploading {uploadCount}/{imageFiles.length}</div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" onClick={() => { if (onCancel) onCancel(); }} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-5 py-2 bg-linear-to-r from-green-500 to-green-700 text-white rounded-lg shadow-md text-sm font-semibold transition disabled:opacity-50" disabled={loading || uploading}>
            {loading || uploading ? 'Saving...' : 'Save Product'}
          </button>
        </div>

        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      </div>
    </form>
  );
};

export default ProductForm;
