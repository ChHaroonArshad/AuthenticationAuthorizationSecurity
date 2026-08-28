import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const OAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Grab the token Google's callback put in the URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error || !token) {
            // Something went wrong — send to login with an error message
            navigate("/login?error=" + (error || "no_token"));
            return;
        }

        // Store access token exactly like your normal login does
        localStorage.setItem("accessToken", token);

        // Clean the token out of the URL, then go home
        const { role } = jwtDecode(token);
        if (role === "admin") navigate("/admin/dashboard", { replace: true });
        else if (role === "seller") navigate("/seller/dashboard", { replace: true });
        else navigate("/buyer/dashboard", { replace: true });
    }, [navigate]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#201a16",
            color: "#f1e9dd",
            fontFamily: "Georgia, serif",
            fontSize: "18px"
        }}>
            Completing sign in…
        </div>
    );
};

export default OAuthCallback;