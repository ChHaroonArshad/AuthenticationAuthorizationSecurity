import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const { role } = jwtDecode(token);

      if (role === "admin")       navigate("/admin/dashboard",  { replace: true });
      else if (role === "seller") navigate("/seller/dashboard", { replace: true });
      else                        navigate("/buyer/dashboard",  { replace: true });

    } catch {
      localStorage.removeItem("accessToken");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return null;
};

export default Home;