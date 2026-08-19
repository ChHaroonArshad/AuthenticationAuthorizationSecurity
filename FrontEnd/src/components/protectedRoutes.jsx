import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoutes() {
  const accessToken = localStorage.getItem("accessToken");

  // User is not logged in
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in
  return <Outlet />;
}

export default ProtectedRoutes;