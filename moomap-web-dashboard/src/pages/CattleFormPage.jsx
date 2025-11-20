import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import api from "../api/client";

function clean(val) {
  if (typeof val === "string") return val.trim();
  return val;
}

export default function CattleFormPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const showCollar = search.get("showCollar");

  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cattleId: "",
    name: "",
    breed: "",
    age: "",
    gender: "",
    color: "",
    weight: "",
    healthNotes: "",
    farmName: "",
    address: "",
    Image: "",
    collarId: "",
    userId: ""
  });

  const [collar, setCollar] = useState(null);

  const loadCattle = async () => {
    if (!isEdit) return;

    const res = await api.get(`/cattles/${id}`);
    const c = res.data;

    const cleaned = {};
    Object.keys(c).forEach((k) => (cleaned[k] = clean(c[k])));

    setForm(cleaned);

    // if user clicked "Live data"
    if (showCollar && cleaned.collarId) {
      const col = await api.get(`/collar-data/${cleaned.collarId.trim()}`);
      setCollar(col.data);
    }
  };

  useEffect(() => {
    loadCattle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      age: Number(form.age),
      weight: Number(form.weight),
    };

    if (isEdit) {
      await api.put(`/cattles/${id}`, payload);
    } else {
      await api.post(`/cattles`, payload);
    }

    navigate("/cattles");
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">
            {isEdit ? "Edit Cattle" : "Add New Cattle"}
          </div>
        </div>

        <Link className="table-link" to="/cattles">
          ← Back
        </Link>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit}>
          {Object.keys(form).map((key) =>
            key === "cattleId" && !isEdit ? null : (
              <div className="form-field" key={key}>
                <label className="form-label">{key}</label>
                <input
                  className="form-input"
                  type="text"
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            )
          )}

          <button type="submit" className="btn-primary">
            {isEdit ? "Save Changes" : "Create Cattle"}
          </button>
        </form>
      </div>

      {/* COLLAR DATA */}
      {collar && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h2>Live Collar Data</h2>

          <div className="detail-grid">
            <div>
              <div className="detail-item-label">Status</div>
              <div className="detail-item-value">{collar.status}</div>
            </div>
            <div>
              <div className="detail-item-label">Last Seen</div>
              <div className="detail-item-value">
                {new Date(collar.lastSeen).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="detail-item-label">Latitude</div>
              <div className="detail-item-value">
                {collar.lastLocation?.lat}
              </div>
            </div>
            <div>
              <div className="detail-item-label">Longitude</div>
              <div className="detail-item-value">
                {collar.lastLocation?.lon}
              </div>
            </div>
          </div>

          <pre className="detail-json">
            {JSON.stringify(collar, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
