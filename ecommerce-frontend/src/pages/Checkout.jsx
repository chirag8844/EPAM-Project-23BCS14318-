import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const PAYMENT_OPTIONS = [
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
  { value: "UPI", label: "UPI (Mock)" },
  { value: "CARD", label: "Card (Mock)" },
];

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return fallback;
}

const getProductImage = (product) => {
  const imageUrlRaw = product?.images?.length
    ? product.images[0]
    : `https://picsum.photos/seed/${product?.id || "product"}/160/160`;

  return imageUrlRaw && (imageUrlRaw.startsWith("http") || imageUrlRaw.startsWith("data:"))
    ? imageUrlRaw
    : `${api.defaults.baseURL}${imageUrlRaw}`;
};

const getDeliveryRange = (baseDate = new Date()) => {
  const addDays = (d, days) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  };

  const formatShort = (date) => {
    const day = date.toLocaleString(undefined, { day: 'numeric' });
    const month = date.toLocaleString(undefined, { month: 'short' });
    const weekday = date.toLocaleString(undefined, { weekday: 'short' });
    return `${day} ${month}, ${weekday}`;
  };

  const start = addDays(baseDate, 5);
  const end = addDays(baseDate, 6);
  return `${formatShort(start)} - ${formatShort(end)}`;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProductId = location.state?.selectedProductId;

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");

  useEffect(() => {
    const rawUser = sessionStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user?.name) {
      setDeliveryDetails((prev) => ({ ...prev, name: user.name }));
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/cart");
      let cartData = res.data;
      
      // If a specific product was selected, filter the cart items
      if (selectedProductId && cartData?.items) {
        cartData = {
          ...cartData,
          items: cartData.items.filter(item => item.product?.id === selectedProductId)
        };
      }
      
      setCart(cartData);
    } catch (e) {
      setCart(null);
      setError("Failed to load checkout details");
    } finally {
      setLoading(false);
    }
  };

  const total = cart?.items ? cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) : 0;

  const handleChange = (field, value) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    if (!deliveryDetails.name.trim() || !deliveryDetails.address.trim() || !deliveryDetails.phone.trim()) {
      setError("Please fill in all delivery details");
      return;
    }
    if (!cart?.items?.length) {
      setError("Your cart is empty");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await api.post("/orders", {
        cartItems: cart.items.map((item) => ({
          productId: item.product?.id,
          quantity: item.quantity,
        })),
        deliveryDetails,
        paymentMethod,
      });
      try { window.dispatchEvent(new Event("cart:updated")); } catch (e) {}
      try { window.dispatchEvent(new Event("order:placed")); } catch (e) {}
      window.alert("✔ Order placed successfully");
      navigate("/orders");
    } catch (e) {
      setError(getErrorMessage(e, "Failed to place order"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Loading checkout...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Checkout</h1>
      {error && <div className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">{error}</div>}

      {!cart?.items?.length ? (
        <div className="rounded bg-white p-8 shadow text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button onClick={() => navigate("/products")} className="rounded bg-indigo-600 px-4 py-2 text-white">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded bg-white p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={deliveryDetails.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Name"
                  className="w-full rounded border px-3 py-2"
                />
                <textarea
                  value={deliveryDetails.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Address"
                  rows={4}
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  type="tel"
                  value={deliveryDetails.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone"
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </section>

            <section className="rounded bg-white p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 rounded border p-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          <section className="h-fit rounded bg-white p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product?.name}
                    className="h-20 w-20 rounded-lg object-cover border bg-gray-50 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-medium text-gray-900 leading-tight mb-1">{item.product?.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                       <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                         Delivery by {getDeliveryRange()}
                       </div>
                       <div className="font-bold text-gray-900">Rs. {(item.unitPrice * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={submitting}
              className="mt-6 w-full rounded bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
