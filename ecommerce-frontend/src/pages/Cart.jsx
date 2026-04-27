import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getProductImage = (product) => {
    const imageUrlRaw = product?.images?.length
      ? product.images[0]
      : `https://picsum.photos/seed/${product?.id || "cart-item"}/160/160`;

    return imageUrlRaw && (imageUrlRaw.startsWith("http") || imageUrlRaw.startsWith("data:"))
      ? imageUrlRaw
      : `${api.defaults.baseURL}${imageUrlRaw}`;
  };

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (e) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const showError = (txt) => { setError(txt); setTimeout(() => setError(null), 4000); };

  const updateQty = async (itemId, qty) => {
    try {
      await api.put(`/cart/item/${itemId}`, { quantity: qty });
      await fetchCart();
      try { window.dispatchEvent(new Event("cart:updated")); } catch (e) {}
    } catch (e) {
      showError(e?.response?.data || "Failed to update");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/item/${itemId}`);
      await fetchCart();
      try { window.dispatchEvent(new Event("cart:updated")); } catch (e) {}
    } catch (e) {
      showError(e?.response?.data || "Failed to remove");
    }
  };

  const total = cart?.items ? cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      {error && <div className="p-3 bg-red-100 text-red-800 rounded mb-3">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          {!cart || !cart.items || cart.items.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Your cart is empty</div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 p-3 border-b sm:flex-row sm:items-center sm:justify-between">
                  <div 
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => navigate(`/products/${item.product.id}`)}
                    title={`View ${item.product?.name}`}
                  >
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product?.name || "Product"}
                      className="h-20 w-20 rounded-lg object-cover border bg-gray-100 group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                    <div>
                      <div className="font-medium group-hover:text-blue-600 transition-colors">{item.product?.name}</div>
                      <div className="text-sm text-gray-500">Rs. {item.unitPrice} x {item.quantity} = Rs. {(item.unitPrice * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.id, Math.max(1, parseInt(e.target.value || 1)))}
                      className="w-20 border p-1 rounded"
                    />
                    <button 
                      onClick={() => navigate("/checkout", { state: { selectedProductId: item.product?.id } })} 
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Order
                    </button>
                    <button onClick={() => removeItem(item.id)} className="px-3 py-1 bg-red-500 text-white rounded">Remove</button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between mt-4">
                <div className="text-xl font-semibold">Total: Rs. {total.toFixed(2)}</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate("/products")} className="px-4 py-2 border rounded">Continue Shopping</button>
                  <button onClick={() => navigate("/checkout")} className="px-4 py-2 bg-green-600 text-white rounded">Order</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
