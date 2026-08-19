import { BrowserRouter, Routes, Route } from "react-router-dom";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

import ProtectedRoutes from "./components/ProtectedRoutes";
import PublicRoutes from "./components/PublicRoutes";
function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            PUBLIC ROUTES
            Logged-in users CANNOT access
        ========================= */}

        <Route element={<PublicRoutes />}>

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

        </Route>


        {/* =========================
            RESET PASSWORD
            Accessible to everyone
        ========================= */}

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route element={<ProtectedRoutes />}>

          <Route
            path="/home"
            element={<Home />}
          />

        </Route>

          {/* =========================
            verify email ROUTES
        ========================= */}
<Route
  path="/verify-email/:token"
  element={<VerifyEmail />}
/>
      </Routes>

    </BrowserRouter>
  );
}

export default App;