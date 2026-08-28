import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Usage in App.jsx:
// <Route element={<RoleBasedRoute allowedRoles={["buyer", "seller", "admin"]} />}>
//   <Route path="/dashboard" element={<Dashboard />} />
// </Route>

const RoleBasedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("accessToken");

  // No token at all → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Token expired → go to login
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("accessToken");
      return <Navigate to="/login" replace />;
    }

    const userRole = decoded.role;

    // Role not in the allowed list → go to unauthorized
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // All checks passed → render the page
    return <Outlet />;

  } catch (error) {
    // Malformed token → go to login
    localStorage.removeItem("accessToken");
    return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRoute;