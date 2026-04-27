import { useEffect, useState } from "react";
import api from "../services/api";

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return fallback;
}

export default function VendorNotifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("user");
    if (!raw) {
      setLoading(false);
      setError("Vendor session not found. Please log in again.");
      return;
    }

    let user = null;
    try {
      user = JSON.parse(raw);
    } catch (e) {
      setLoading(false);
      setError("Unable to read vendor session.");
      return;
    }

    if (!user || user.role !== "VENDOR" || !user.id) {
      setLoading(false);
      setError("Vendor account is required to view notifications.");
      return;
    }

    const fetchNotifs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/notifications/vendor/${user.id}`);
        setNotifs(res.data || []);
      } catch (e) {
        setNotifs([]);
        setError(getErrorMessage(e, "Failed to load notifications"));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      setError(getErrorMessage(e, "Failed to mark notification as read"));
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="rounded bg-red-100 px-4 py-3 text-red-700">{error}</div>
        ) : notifs.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : (
          <div className="space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className={`p-3 rounded border ${n.read ? "bg-gray-50" : "bg-white"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt || n.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {!n.read && (
                    <button onClick={() => markRead(n.id)} className="text-sm text-blue-600">Mark read</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
