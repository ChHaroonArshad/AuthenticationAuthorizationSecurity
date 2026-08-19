import { BrowserRouter, Routes, Route } from "react-router-dom";

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
            Accessible whether logged in or not
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

      </Routes>

    </BrowserRouter>
  );
}

export default App;