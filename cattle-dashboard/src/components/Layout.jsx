import { NavLink, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const userMobile = localStorage.getItem("userMobile") || "Unknown";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userMobile");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span>MM</span>
          </div>
          <div className="sidebar-title">
            <span className="sidebar-title-main">MooMap</span>
            <span className="sidebar-title-sub">Cattle Tracking Console</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/devices"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-link-dot" />
            Devices
          </NavLink>

          {/* NEW: Cattles nav */}
          <NavLink
            to="/cattles"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-link-dot" />
            Cattles
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          Backend: Node.js • MongoDB • PostgreSQL
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-title">MooMap Dashboard</span>
            <span className="topbar-subtitle">
              Monitor collars, devices and field status in real time.
            </span>
          </div>
          <div className="topbar-right">
            <div className="user-pill">
              <span>👤</span>
              <span>{userMobile}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="main-content">{children}</div>
      </main>
    </div>
  );
}
