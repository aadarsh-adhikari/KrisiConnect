"use client";
import { useState } from "react";
import axios from "axios";

const ProductForm = ({ onSave, initial, loading }) => {
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
  const [error, setError] = useState("");

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageRemove = (img) => {
    setForm({ ...form, images: form.images.filter((i) => i !== img) });
    setImageFiles(imageFiles.filter((f) => f.preview !== img));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = form.images.length;
    const maxImages = 7;

    if (currentCount >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const availableSlots = maxImages - currentCount;
    const filesToAdd = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(`Only ${availableSlots} more image(s) can be added (max ${maxImages} total)`);
    }

    const previews = filesToAdd.map((file) => {
      const url = URL.createObjectURL(file);
      return { file, preview: url };
    });
    setImageFiles((prev) => [...prev, ...previews]);
    setForm({ ...form, images: [...form.images, ...previews.map((p) => p.preview)] });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post("/api/upload", formData);
    return res.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);
    try {
      const existing = form.images.filter((img) => img.startsWith("http"));
      const files = imageFiles.map((f) => f.file);
      const uploaded = await Promise.all(files.map(uploadImage));
      const payload = { ...form, images: [...existing, ...uploaded] };
      await onSave(payload);
      setImageFiles([]);
    } catch (err) {
      console.error("Image upload failed", err);
      setError(err?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="w-full px-3 py-2 border rounded" />
      <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="w-full px-3 py-2 border rounded" />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 border rounded"
      >
        <option value="" disabled>
          Select Category
        </option>
        {categoryOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="Price" className="w-full px-3 py-2 border rounded" />
      <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="Quantity" className="w-full px-3 py-2 border rounded" />
      <input name="location" value={form.location} onChange={handleChange} required placeholder="Location" className="w-full px-3 py-2 border rounded" />
      <div>
        <div className="flex gap-2 mb-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="flex-1 px-3 py-2 border rounded"
            disabled={form.images.length >= 7}
          />
          <span className="text-sm text-gray-600 self-center">{form.images.length}/7</span>
        </div>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <img src={img} alt="product" className="w-10 h-10 object-cover rounded" />
                <button type="button" onClick={() => handleImageRemove(img)} className="text-red-500 text-xs">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading || uploading}>
        {loading || uploading ? "Saving..." : "Save Product"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
};

export default ProductForm;
