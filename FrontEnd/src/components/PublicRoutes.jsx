import { Navigate, Outlet } from "react-router-dom";

function PublicRoutes() {
  const accessToken = localStorage.getItem("accessToken");

  // User is already logged in
  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  // User is not logged in
  return <Outlet />;
}

export default PublicRoutes;