import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children, role }) {
  const token = sessionStorage.getItem("token");
  const raw = sessionStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
