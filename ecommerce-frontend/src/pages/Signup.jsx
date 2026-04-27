import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post("http://localhost:8080/users", user);
      if (res.data && res.data.token) {
        sessionStorage.setItem('token', res.data.token);
        sessionStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user && res.data.user.role === 'VENDOR') navigate('/vendor');
      }
      alert("Signup Successful");
    } catch (err) {
      console.error(err);
      alert("Signup Failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="border p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-4">Signup</h2>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-3"
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-3"
          onChange={(e) => setUser({ ...user, role: e.target.value })}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
        </select>

        <button
          onClick={handleSignup}
          className="bg-green-500 text-white w-full p-2 rounded"
        >
          Signup
        </button>
      </div>
    </div>
  );
}

export default Signup;