import { Navigate, Outlet, useLocation } from "react-router-dom";

function PublicRoutes() {
  const accessToken = localStorage.getItem("accessToken");
  const location = useLocation();

  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default PublicRoutes;