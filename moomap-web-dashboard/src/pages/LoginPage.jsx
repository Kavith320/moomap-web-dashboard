import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/users/login", { mobile, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userMobile", res.data.user?.mobile || mobile);
      navigate("/devices");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Login failed. Check mobile & password."
      );
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div className="sidebar-logo">
            <span>MM</span>
          </div>
          <div>
            <div className="login-title">Welcome to MooMap</div>
            <div className="login-subtitle">Sign in to access your console</div>
          </div>
        </div>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Mobile</label>
            <input
              className="form-input"
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="07XXXXXXXX"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
