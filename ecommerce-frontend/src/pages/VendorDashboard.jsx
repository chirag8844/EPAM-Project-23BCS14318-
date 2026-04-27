import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";


export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    brand: "",
    sellerInfo: "",
    discountPercentage: "",
  });

  const [highlights, setHighlights] = useState([]); // {key, value} pairs for add-form

  // New product upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Edit product state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  // unified list of image items for edit mode (existing + newly added)
  const [editImageItems, setEditImageItems] = useState([]);
  const [editHighlights, setEditHighlights] = useState([]); // {key, value} pairs for edit-form

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("user");
    if (!raw) return;
    const u = JSON.parse(raw);
    setUser(u);
    if (u.role === "VENDOR") fetchProducts(u.id);
  }, []);

  // Previews for add-product file input
  useEffect(() => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  const fetchProducts = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/products/vendor/${id}`);
      setProducts(res.data || []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!user) return;
    await fetchProducts(user.id);
  };

  const showMessage = (txt) => {
    setMessage(txt);
    setTimeout(() => setMessage(null), 3000);
  };
  const showError = (txt) => {
    setError(txt);
    setTimeout(() => setError(null), 4000);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  // Helpers for reordering/removing
  const moveArrayItem = (arr, from, to) => {
    const copy = [...arr];
    if (to < 0 || to >= copy.length) return copy;
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    return copy;
  };

  const moveSelectedFile = (index, dir) => {
    setSelectedFiles((prev) => moveArrayItem(prev, index, index + dir));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const items = files.map((file) => ({
      id: `new-${Math.random().toString(36).slice(2)}`,
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    setEditImageItems((prev) => [...prev, ...items]);
  };

  const moveEditItem = (index, dir) => {
    setEditImageItems((prev) => moveArrayItem(prev, index, index + dir));
  };

  const removeEditItem = (id) => {
    setEditImageItems((prev) => {
      const found = prev.find((it) => it.id === id);
      if (found && found.type === "new" && found.preview) URL.revokeObjectURL(found.preview);
      return prev.filter((it) => it.id !== id);
    });
  };


  const handleAdd = async () => {
    if (!user) return showError("You must be logged in as a vendor");
    if (!form.name || !form.price || !form.quantity || !form.category) {
      return showError("Please enter name, price, quantity and select a category");
    }

    try {
      setLoading(true);
      const price = parseFloat(String(form.price).replace(/[^0-9.]/g, "")) || 0;
      const quantity = parseInt(String(form.quantity).replace(/[^0-9]/g, "")) || 0;

      const product = {
        name: form.name,
        description: form.description,
        price,
        quantity,
        category: form.category,
        brand: form.brand,
        // Existing images (if any)
        images: [],
      };

      // optional fields: include only when provided
      if (form.sellerInfo && String(form.sellerInfo).trim() !== "") product.sellerInfo = String(form.sellerInfo).trim();
      if (form.discountPercentage !== undefined && form.discountPercentage !== null && String(form.discountPercentage).trim() !== "") {
        const d = parseFloat(String(form.discountPercentage).replace(/[^0-9.]/g, ""));
        if (isNaN(d) || (d >= 0 && d <= 100)) {
          product.discountPercentage = d;
        }
      }
      if (highlights && highlights.length > 0) {
        const map = {};
        highlights.forEach((h) => {
          if (h && h.key && h.value) map[h.key] = h.value;
        });
        if (Object.keys(map).length > 0) product.highlights = map;
      }

      const formData = new FormData();
      // Send product as a JSON part
      formData.append("product", new Blob([JSON.stringify(product)], { type: "application/json" }));

      // Append all files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showMessage("Product added");
      setForm({ name: "", description: "", price: "", quantity: "", category: "", brand: "", sellerInfo: "", discountPercentage: "" });
      setSelectedFiles([]);
      setHighlights([]);
      setPreviews([]);
      await refresh();
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      showError(serverMsg || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      showMessage("Product deleted");
    } catch (err) {
      console.error(err);
      showError("Failed to delete product");
    }
  };

  const imgUrl = (url) => (url && url.startsWith("http") ? url : `${api.defaults.baseURL}${url}`);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price != null ? String(p.price) : "",
      quantity: p.quantity != null ? String(p.quantity) : "",
      category: p.category || "",
      brand: p.brand || "",
      sellerInfo: p.sellerInfo || "",
      discountPercentage: p.discountPercentage != null ? String(p.discountPercentage) : "",
    });

    const items = (p.images || []).map((raw, i) => ({
      id: `ex-${i}-${Math.random().toString(36).slice(2)}`,
      type: "existing",
      raw,
      src: imgUrl(raw),
    }));
    setEditImageItems(items);
    // populate highlights for edit form
    const h = [];
    if (p.highlights) {
      Object.entries(p.highlights).forEach(([k, v]) => h.push({ key: k, value: v }));
    }
    setEditHighlights(h);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    // revoke previews of any new items
    editImageItems.forEach((it) => {
      if (it.type === "new" && it.preview) URL.revokeObjectURL(it.preview);
    });
    setEditImageItems([]);
    setEditHighlights([]);
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      if (!editForm.category) {
        setLoading(false);
        return showError("Category is mandatory");
      }
      const price = parseFloat(String(editForm.price).replace(/[^0-9.]/g, "")) || 0;
      const quantity = parseInt(String(editForm.quantity).replace(/[^0-9]/g, "")) || 0;

      // Existing images to keep
      const existingImages = editImageItems.filter((it) => it.type === "existing").map((it) => it.raw);
      // New files to upload
      const newFiles = editImageItems.filter((it) => it.type === "new").map((it) => it.file);

      const payload = {
        name: editForm.name,
        description: editForm.description,
        price,
        quantity,
        category: editForm.category,
        brand: editForm.brand,
        images: existingImages, // Send existing URLs
      };

      // optional fields
      if (editForm.sellerInfo && String(editForm.sellerInfo).trim() !== "") payload.sellerInfo = String(editForm.sellerInfo).trim();
      if (editForm.discountPercentage !== undefined && editForm.discountPercentage !== null && String(editForm.discountPercentage).trim() !== "") {
        const d = parseFloat(String(editForm.discountPercentage).replace(/[^0-9.]/g, ""));
        if (!isNaN(d) && d >= 0 && d <= 100) {
          payload.discountPercentage = d;
        }
      }
      if (editHighlights && editHighlights.length > 0) {
        const map = {};
        editHighlights.forEach((h) => {
          if (h && h.key && h.value) map[h.key] = h.value;
        });
        if (Object.keys(map).length > 0) payload.highlights = map;
      }

      const formData = new FormData();
      formData.append("product", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (newFiles.length > 0) {
        newFiles.forEach((f) => formData.append("files", f));
      }

      await api.put(`/products/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refresh();

      // cleanup previews
      editImageItems.forEach((it) => {
        if (it.type === "new" && it.preview) URL.revokeObjectURL(it.preview);
      });

      cancelEdit();
      showMessage("Product updated");
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      showError(serverMsg || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h2>
            <p className="text-sm text-gray-600">Manage your products and inventory</p>
          </div>
        </div>

        {message && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-3 rounded" />

            <input
              placeholder="Category (e.g. Footwear, Electronics)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border p-3 rounded"
            />

            <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="border p-3 rounded" />

            <input placeholder="Seller Info (optional)" value={form.sellerInfo} onChange={(e) => setForm({ ...form, sellerInfo: e.target.value })} className="border p-3 rounded" />

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></span>
              <input placeholder="Price (e.g. 9.99)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border p-3 rounded pl-9" />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></span>
              <input placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="border p-3 rounded pl-12" />
            </div>

            <div className="relative">
              <input placeholder="Discount % (optional)" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="border p-3 rounded" />
            </div>

            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border p-3 rounded" />

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Highlights (optional)</label>
              {highlights.map((h, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input placeholder="Key" value={h.key} onChange={(e) => setHighlights((prev) => prev.map((it, idx) => idx === i ? { ...it, key: e.target.value } : it))} className="border p-2 rounded w-1/3" />
                  <input placeholder="Value" value={h.value} onChange={(e) => setHighlights((prev) => prev.map((it, idx) => idx === i ? { ...it, value: e.target.value } : it))} className="border p-2 rounded flex-1" />
                  <button onClick={() => setHighlights((prev) => prev.filter((_, idx) => idx !== i))} className="px-2 bg-red-200 rounded">Remove</button>
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={() => setHighlights((prev) => [...prev, { key: "", value: "" }])} className="px-3 py-1 bg-gray-100 rounded">Add Highlight</button>
                <div className="text-sm text-gray-500 self-center">Optional key/value pairs to show on product page</div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Photos (optional)</label>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} />
              <div className="flex gap-2 mt-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={p} className="w-20 h-20 object-cover rounded border" alt={`preview-${i}`} />
                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                      <button onClick={() => moveSelectedFile(i, -1)} className="bg-white/80 rounded p-0.5 text-xs">◀</button>
                      <button onClick={() => moveSelectedFile(i, 1)} className="bg-white/80 rounded p-0.5 text-xs">▶</button>
                      <button onClick={() => removeSelectedFile(i)} className="bg-white/80 rounded p-0.5 text-xs">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleAdd} disabled={loading} className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded shadow hover:scale-105 transition">{loading ? "Saving..." : "Add Product"}</button>
            <button onClick={refresh} className="px-4 py-2 border rounded">Refresh</button>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Your Products</h3>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 bg-white rounded shadow animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <div className="p-6 bg-white rounded shadow">No products yet — add one above.</div>
            ) : (
              products.map((p) => (
                <motion.div key={p.id} whileHover={{ y: -6 }} className="bg-white p-4 rounded-lg shadow">
                  {p.images && p.images.length > 0 && (
                    <img src={imgUrl(p.images[0])} alt={p.name} className="w-full h-40 object-cover rounded mb-3" />
                  )}

                  {editingId === p.id ? (
                    <div className="space-y-2">
                      <input className="border p-2 w-full rounded" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />

                      <input
                        placeholder="Category"
                        className="border p-2 w-full rounded"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      />
                      <div className="flex gap-2">
                        {/* <div className="relative w-1/2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">₹</span>
                          <input type="text" className="border p-2 w-full rounded pl-9" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                        </div> */}
                        <div className="flex items-center w-1/2 border rounded px-3">
                          <span className="text-gray-400 mr-2">₹</span>
                          <input
                            type="text"
                            className="w-full p-2 outline-none"
                            value={editForm.price}
                            onChange={(e) =>
                              setEditForm({ ...editForm, price: e.target.value })
                            }
                          />
                        </div>
                        {/* <div className="relative w-1/2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">Qty</span>
                          <input type="text" className="border p-2 w-full rounded pl-12" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
                        </div> */}
                        <div className="relative w-1/2">
                          <span className="absolute left-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                            Qty
                          </span>
                          <input
                            type="text"
                            className="border w-full rounded h-10 pl-14 pr-3 box-border"
                            value={editForm.quantity}
                            onChange={(e) =>
                              setEditForm({ ...editForm, quantity: e.target.value })
                            }
                          />
                        </div>

                      </div>
                      <textarea className="border p-2 w-full rounded" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />

                      <input className="border p-2 w-full rounded" placeholder="Seller Info (optional)" value={editForm.sellerInfo} onChange={(e) => setEditForm({ ...editForm, sellerInfo: e.target.value })} />
                      <input className="border p-2 w-full rounded" placeholder="Discount % (optional)" value={editForm.discountPercentage} onChange={(e) => setEditForm({ ...editForm, discountPercentage: e.target.value })} />

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Highlights (optional)</label>
                        {editHighlights.map((h, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <input placeholder="Key" value={h.key} onChange={(e) => setEditHighlights((prev) => prev.map((it, idx) => idx === i ? { ...it, key: e.target.value } : it))} className="border p-2 rounded w-1/3" />
                            <input placeholder="Value" value={h.value} onChange={(e) => setEditHighlights((prev) => prev.map((it, idx) => idx === i ? { ...it, value: e.target.value } : it))} className="border p-2 rounded flex-1" />
                            <button onClick={() => setEditHighlights((prev) => prev.filter((_, idx) => idx !== i))} className="px-2 bg-red-200 rounded">Remove</button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button onClick={() => setEditHighlights((prev) => [...prev, { key: "", value: "" }])} className="px-3 py-1 bg-gray-100 rounded">Add Highlight</button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Photos (drag/reorder using arrows)</label>
                        <input type="file" accept="image/*" multiple onChange={handleEditFileChange} />
                        <div className="flex gap-2 mt-2">
                          {editImageItems.map((it, idx) => (
                            <div key={it.id} className="relative w-20 h-20">
                              <img src={it.type === "existing" ? it.src : it.preview} className="w-20 h-20 object-cover rounded border" alt={`img-${idx}`} />
                              <div className="absolute top-1 right-1 flex flex-col gap-1">
                                <button onClick={() => moveEditItem(idx, -1)} className="bg-white/80 rounded p-0.5 text-xs">◀</button>
                                <button onClick={() => moveEditItem(idx, 1)} className="bg-white/80 rounded p-0.5 text-xs">▶</button>
                                <button onClick={() => removeEditItem(it.id)} className="bg-white/80 rounded p-0.5 text-xs">✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg">{p.name}</h4>
                        <div className="text-sm text-gray-500">₹{p.price}</div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{p.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">Qty: {p.quantity}</div>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(p)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
