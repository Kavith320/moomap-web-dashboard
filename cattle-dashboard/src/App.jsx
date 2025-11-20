import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DevicesPage from "./pages/DevicesPage";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import Layout from "./components/Layout";

// NEW:
import CattlesPage from "./pages/CattlesPage";
import CattleFormPage from "./pages/CattleFormPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/devices"
          element={
            <PrivateRoute>
              <Layout>
                <DevicesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/devices/:id"
          element={
            <PrivateRoute>
              <Layout>
                <DeviceDetailPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* NEW: Cattles list */}
        <Route
          path="/cattles"
          element={
            <PrivateRoute>
              <Layout>
                <CattlesPage />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* NEW: Create cattle */}
        <Route
          path="/cattles/new"
          element={
            <PrivateRoute>
              <Layout>
                <CattleFormPage />
              </Layout>
            </PrivateRoute>
          }
        />
        {/* NEW: Edit cattle */}
        <Route
          path="/cattles/:id"
          element={
            <PrivateRoute>
              <Layout>
                <CattleFormPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/devices" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
