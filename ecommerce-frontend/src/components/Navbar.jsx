import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import UserAvatar from "./UserAvatar";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateUser = () => {
      const raw = sessionStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    updateUser();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, [location]);

  const isVendor = user?.role === "VENDOR";
  const isCustomer = !!user && !isVendor;

  useEffect(() => {
    if (!isVendor || !user?.id) {
      setNotifications([]);
      return;
    }

    const fetchVendorNotifications = async () => {
      try {
        const res = await api.get(`/notifications/vendor/${user.id}`);
        setNotifications(res.data || []);
      } catch (e) {
        setNotifications([]);
      }
    };

    fetchVendorNotifications();
  }, [isVendor, user, location]);

  useEffect(() => {
    if (!isCustomer) {
      setCartCount(0);
      setNotifCount(0);
      return;
    }

    const fetchCounts = async () => {
      try {
        const cartRes = await api.get("/cart/count");
        setCartCount(cartRes.data?.count || 0);
      } catch (e) {
        setCartCount(0);
      }

      try {
        const notifRes = await api.get("/notifications/unread-count");
        setNotifCount(notifRes.data?.count || 0);
      } catch (e) {
        setNotifCount(0);
      }
    };

    fetchCounts();
    const refreshCounts = () => { fetchCounts(); };
    window.addEventListener("cart:updated", refreshCounts);
    return () => window.removeEventListener("cart:updated", refreshCounts);
  }, [isCustomer, location]);

  useEffect(() => {
    const handleDocClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setShowNotif(false);
    navigate("/login");
  };

  const unreadVendorNotifications = notifications.filter((n) => !n.read).length;

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/20 border-b border-white/30 shadow-md"
    >
      <div className="flex justify-between items-center px-10 py-4">
        <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm">MultiVendor</h1>

        <div className="hidden md:flex gap-8">
          <Link to="/" className="text-gray-800 font-medium hover:text-purple-600 transition">Home</Link>
          {!isVendor && (
            <Link to="/products" className="text-gray-800 font-medium hover:text-purple-600 transition">Products</Link>
          )}
          <Link to="/about" className="text-gray-800 font-medium hover:text-purple-600 transition">About</Link>
          <Link to="/contact" className="text-gray-800 font-medium hover:text-purple-600 transition">Contact</Link>
        </div>

        <div className="flex gap-4 items-center relative">
          {user ? (
            <>
              {isVendor && (
                <>
                  <button
                    onClick={async () => {
                      setShowNotif((value) => !value);
                      if (!showNotif) {
                        try {
                          const res = await api.get(`/notifications/vendor/${user.id}`);
                          setNotifications(res.data || []);
                        } catch (e) {
                          setNotifications([]);
                        }
                      }
                    }}
                    className="relative p-2 rounded hover:bg-gray-100"
                    title="Notifications"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                    </svg>
                    {unreadVendorNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold px-1 rounded-full">
                        {unreadVendorNotifications}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 mt-12 w-80 bg-white shadow-lg border rounded p-3 z-50">
                      <div className="flex items-center justify-between mb-2">
                        <strong>Notifications</strong>
                        <button onClick={() => setShowNotif(false)} className="text-sm text-gray-500">Close</button>
                      </div>
                      <div className="max-h-64 overflow-auto">
                        {notifications.length === 0 && <div className="text-sm text-gray-500">No notifications</div>}
                        {notifications.map((notification) => (
                          <div key={notification.id} className={`p-2 rounded mb-1 ${notification.read ? "bg-gray-50" : "bg-white"}`}>
                            <div className="text-sm text-gray-800">{notification.message}</div>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-xs text-gray-400">{new Date(notification.createdAt || notification.timestamp).toLocaleString()}</div>
                              {!notification.read && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.put(`/notifications/${notification.id}/read`);
                                      setNotifications((prev) => prev.map((item) => (
                                        item.id === notification.id ? { ...item, read: true } : item
                                      )));
                                    } catch (e) {}
                                  }}
                                  className="text-xs text-blue-600"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-right">
                        <Link to="/vendor/notifications" onClick={() => setShowNotif(false)} className="text-sm text-purple-600">View all</Link>
                      </div>
                    </div>
                  )}

                  <Link to="/vendor">
                    <button className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-white/40 transition">Dashboard</button>
                  </Link>
                </>
              )}

              {isCustomer && (
                <div className="flex items-center gap-2 mr-2">
                  <Link to="/cart">
                    <button className="relative p-2 rounded hover:bg-gray-100" title="Cart">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
                      </svg>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[11px] font-bold px-1 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  <Link to="/notifications">
                    <button className="relative p-2 rounded hover:bg-gray-100" title="Notifications">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0h6z" />
                      </svg>
                      {notifCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold px-1 rounded-full">
                          {notifCount}
                        </span>
                      )}
                    </button>
                  </Link>

                  {/* <Link to="/orders">
                    <button className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50">Orders</button>
                  </Link> */}
                <Link
                  to="/orders"
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-medium 
                            text-gray-700 bg-white border border-gray-200 
                            shadow-sm transition-all duration-200
                            hover:bg-gray-100 hover:shadow-md 
                            focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 
                            active:scale-95"
                >
                  Orders
                </Link>

                </div>
              )}

              <div className="relative">
                <UserAvatar
                  name={user?.name}
                  imageUrl={user?.imageUrl || user?.profileImage || user?.avatar || user?.picture || user?.photo || user?.image || ""}
                  className="mr-2"
                  onClick={() => {
                    setShowProfileMenu((value) => !value);
                    setShowNotif(false);
                  }}
                />

                {showProfileMenu && (
                  <div ref={profileMenuRef} className="absolute right-0 mt-12 w-44 bg-white shadow-lg border rounded p-1 z-50">
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <button onClick={() => { setShowProfileMenu(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="px-4 py-2 border border-gray-400 text-gray-800 rounded-lg hover:bg-white/40 transition">Login</button>
              </Link>
              <Link to="/signup">
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:scale-105 transition">Signup</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
