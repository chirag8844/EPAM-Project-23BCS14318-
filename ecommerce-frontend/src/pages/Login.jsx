import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      console.log(res.data);
      // store token and user in sessionStorage so it clears on browser close
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      //alert("Login Successful");
      const from = location.state?.from?.pathname;
      if (from) navigate(from, { replace: true });
      else if (res.data.user && res.data.user.role === "VENDOR") navigate("/vendor");
      else if (res.data.user?.role === "CUSTOMER") navigate("/");   // or "/home"


    } catch (err) {
      console.error(err);
      alert("Login Failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="border p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;