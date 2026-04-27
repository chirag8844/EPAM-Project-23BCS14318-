import { useEffect, useState } from "react";
import api from "../services/api";

const getProductImage = (product) => {
  const imageUrlRaw = product?.images?.length
    ? product.images[0]
    : `https://picsum.photos/seed/${product?.id || "product"}/160/160`;

  return imageUrlRaw && (imageUrlRaw.startsWith("http") || imageUrlRaw.startsWith("data:"))
    ? imageUrlRaw
    : `${api.defaults.baseURL}${imageUrlRaw}`;
};

const getDeliveryRange = (createdAt) => {
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  
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

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data || []);
    } catch (e) {
      setOrders([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:pt-24 lg:pb-16 bg-gray-50/50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 px-2">Your Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
          <div className="text-gray-400 mb-4 flex justify-center">
             <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <p className="text-xl font-medium text-gray-600">No orders yet</p>
          <p className="text-gray-400 mt-1">Start shopping to see your orders here!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* ORDER HEADER */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-8 flex-wrap">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order Placed</p>
                    <p className="text-sm font-medium text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recently"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
                    <p className="text-sm font-bold text-gray-900">Rs. {(order.totalPrice ?? order.totalAmount ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Ship To</p>
                    <p className="text-sm font-medium text-indigo-600 cursor-pointer hover:underline">{order.deliveryName || "Customer"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order # {order.id}</p>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-tight">{order.status || "PLACED"}</p>
                </div>
              </div>

              {/* ORDER CONTENT */}
              <div className="p-6">
                <div className="space-y-6">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex gap-6 items-start">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product?.name}
                        className="w-24 h-24 rounded-xl object-cover border border-gray-100 bg-gray-50"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <h4 className="font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors leading-snug">{item.product?.name}</h4>
                             <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                           </div>
                           <p className="font-bold text-gray-900">Rs. {(item.unitPrice * item.quantity).toFixed(2)}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                           <p className="text-sm font-medium text-gray-700">
                             Expected delivery: <span className="text-emerald-700">{getDeliveryRange(order.createdAt)}</span>
                           </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ORDER FOOTER / ACTIONS */}
              <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Payment: {order.paymentMethod?.replaceAll("_", " ") || "CASH"}</span>
                <button className="text-indigo-600 hover:text-indigo-800 transition-colors">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
