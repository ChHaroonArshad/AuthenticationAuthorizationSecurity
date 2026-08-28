import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PublicRoutes() {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    try {
      const { role } = jwtDecode(accessToken);
      if (role === "admin")       return <Navigate to="/admin/dashboard"  replace />;
      if (role === "seller")      return <Navigate to="/seller/dashboard" replace />;
      return                             <Navigate to="/buyer/dashboard"  replace />;
    } catch {
      localStorage.removeItem("accessToken");
    }
  }

  return <Outlet />;
}

export default PublicRoutes;