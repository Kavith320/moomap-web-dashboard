import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

function cleanField(val) {
  if (typeof val === "string") return val.trim();
  return val;
}

export default function DevicesPage() {
  const [rows, setRows] = useState([]); // cattle + collar combined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // 1) Get all cattles -> each has collarId
        const cattlesRes = await api.get("/cattles"); // GET /api/cattles
        const cattlesCleaned = cattlesRes.data.map((c) => {
          const obj = {};
          Object.keys(c).forEach((k) => (obj[k] = cleanField(c[k])));
          return obj;
        });

        // 2) For each cattle with a collarId, call /api/collar-data/:collarId
        const enhanced = await Promise.all(
          cattlesCleaned.map(async (c) => {
            const collarId = c.collarId ? String(c.collarId).trim() : "";

            if (!collarId) {
              return {
                cattleId: c.cattleId,
                name: c.name,
                collarId: "",
                status: "no collar",
                lastLocation: null,
                lastSeen: null,
              };
            }

            try {
              const colRes = await api.get(`/collar-data/${collarId}`); // GET /api/collar-data/:id
              const col = colRes.data;

              return {
                cattleId: c.cattleId,
                name: c.name,
                collarId,
                status: col.status || "unknown",
                lastLocation: col.lastLocation || null,
                lastSeen: col.lastSeen || null,
              };
            } catch (err) {
              console.error("Collar API failed for", collarId, err);
              // If collar API fails, still show cattle info
              return {
                cattleId: c.cattleId,
                name: c.name,
                collarId,
                status: "unknown",
                lastLocation: null,
                lastSeen: null,
              };
            }
          })
        );

        setRows(enhanced);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to load devices");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const total = rows.length;
  const online = rows.filter(
    (d) => d.status && d.status.toLowerCase() !== "unknown" && d.status.toLowerCase() !== "offline"
  ).length;
  const offline = total - online;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Devices overview</div>
          <div className="page-subtitle">
            All collars linked to cattles, using /cattles and /collar-data APIs.
          </div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <div className="card-label">Total devices</div>
          <div className="card-value">{total}</div>
          <div className="card-tag">From cattles with collarId</div>
        </div>
        <div className="card">
          <div className="card-label">Online</div>
          <div className="card-value">{online}</div>
          <div className="card-tag">Based on collar status</div>
        </div>
        <div className="card">
          <div className="card-label">Offline / Unknown</div>
          <div className="card-value">{offline}</div>
          <div className="card-tag">No or unknown collar data</div>
        </div>
      </div>

      <div className="card-table">
        <div className="table-header">
          <div className="table-title">Devices (Cattle + Collar)</div>
          <div className="table-actions">
            <span className="chip">{total} total</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: "0.8rem", color: "#f97373", fontSize: "0.8rem" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "0.8rem" }}>Loading...</div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Cattle</th>
                  <th>Collar ID</th>
                  <th>Status</th>
                  <th>Last Location</th>
                  <th>Last Seen</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const onlineStatus =
                    d.status && d.status.toLowerCase() !== "unknown" && d.status.toLowerCase() !== "offline";
                  return (
                    <tr key={`${d.cattleId}-${d.collarId}`}>
                      <td>
                        {d.name}{" "}
                        <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                          (ID: {d.cattleId})
                        </span>
                      </td>
                      <td>{d.collarId || "—"}</td>
                      <td>
                        <span
                          className={
                            "badge-status " + (onlineStatus ? "" : "offline")
                          }
                        >
                          {d.status || "unknown"}
                        </span>
                      </td>
                      <td>
                        {d.lastLocation
                          ? `${d.lastLocation.lat.toFixed(
                              5
                            )}, ${d.lastLocation.lon.toFixed(5)}`
                          : "N/A"}
                      </td>
                      <td>
                        {d.lastSeen
                          ? new Date(d.lastSeen).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>
                        {d.collarId && (
                          <Link className="table-link" to={`/devices/${d.collarId}`}>
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!rows.length && (
                  <tr>
                    <td colSpan="6" style={{ padding: "0.8rem" }}>
                      No devices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
