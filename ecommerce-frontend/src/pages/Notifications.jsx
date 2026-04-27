import { useEffect, useState } from "react";
import api from "../services/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data || []);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (
        item.id === id ? { ...item, read: true } : item
      )));
      try { window.dispatchEvent(new Event("cart:updated")); } catch (e) {}
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <div className="rounded bg-white p-4 shadow">
        {loading && <div className="p-4 text-gray-500">Loading...</div>}
        {!loading && notifications.length === 0 && (
          <div className="p-4 text-gray-500">No notifications yet</div>
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-3 rounded border p-4 ${notification.read ? "bg-gray-50" : "bg-indigo-50"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-gray-900">{notification.message}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {new Date(notification.createdAt || notification.timestamp).toLocaleString()}
                </div>
              </div>
              {!notification.read && (
                <button onClick={() => markAsRead(notification.id)} className="text-sm text-indigo-600">
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
