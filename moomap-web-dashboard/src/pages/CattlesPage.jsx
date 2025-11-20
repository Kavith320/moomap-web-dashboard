import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

function cleanField(val) {
  if (typeof val === "string") return val.trim();
  return val;
}

export default function CattlesPage() {
  const [cattles, setCattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await api.get("/cattles"); // GET /api/cattles
      const cleaned = res.data.map((c) => {
        const obj = {};
        Object.keys(c).forEach((k) => (obj[k] = cleanField(c[k])));
        return obj;
      });
      setCattles(cleaned);
    } catch (err) {
      console.error(err);
      // if token invalid/expired -> go to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load cattles");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* id */]);

  const handleDelete = async (cattleId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/cattles/${cattleId}`); // DELETE /api/cattles/:id
      setCattles((prev) => prev.filter((c) => c.cattleId !== cattleId));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Cattles</div>
          <div className="page-subtitle">
            Manage all cattle records from your farm.
          </div>
        </div>

        <Link className="table-link" to="/cattles/new">
          + Add cattle
        </Link>
      </div>

      <div className="card-table">
        <div className="table-header">
          <div className="table-title">All Cattles</div>
          <div className="table-actions">
            <span className="chip">{cattles.length} total</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "1rem" }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: "1rem", color: "red" }}>{error}</div>
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Breed</th>
                  <th>Age</th>
                  <th>Collar</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cattles.map((c) => (
                  <tr key={c.cattleId}>
                    <td>{c.cattleId}</td>
                    <td>{c.name}</td>
                    <td>{c.breed}</td> {/* 🔹 fixed here */}
                    <td>{c.age}</td>
                    <td>{c.collarId}</td>
                    <td>
                      <Link className="table-link" to={`/cattles/${c.cattleId}`}>
                        Edit
                      </Link>{" "}
                      •{" "}
                      <button
                        style={{
                          color: "#f97373",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                        onClick={() => handleDelete(c.cattleId)}
                      >
                        Delete
                      </button>{" "}
                      •{" "}
                      <Link
                        className="table-link"
                        to={`/cattles/${c.cattleId}?showCollar=1`}
                      >
                        Live data
                      </Link>
                    </td>
                  </tr>
                ))}

                {!cattles.length && (
                  <tr>
                    <td colSpan="6" style={{ padding: "1rem" }}>
                      No cattles found.
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
