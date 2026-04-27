import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    age: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem("user");
    if (raw) {
      const userData = JSON.parse(raw);
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        age: userData.age || "",
        address: userData.address || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.put("/users/profile", {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        age: formData.age ? parseInt(formData.age) : null,
        address: formData.address,
      });

      // Update session storage with new user data
      const updatedUser = { ...user, ...res.data };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update Navbar triggers
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500">Loading user profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 drop-shadow-sm">Your Profile</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            View and manage your account details
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 rounded-lg text-sm font-medium text-center ${
                message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                disabled
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm"
                value={formData.email}
              />
              <p className="mt-1 text-[10px] text-gray-400">Email cannot be changed for security reasons.</p>
            </div>

            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1 234 567 890"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                placeholder="25"
                min="0"
                max="120"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            {user?.role !== "VENDOR" && (
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-1">Shipping Address / Location</label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="123 Street Name, City, Country"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm transition-all resize-none"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition"
            >
              Back to Home
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
