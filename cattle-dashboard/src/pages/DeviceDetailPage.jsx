import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const deviceIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function DeviceDetailPage() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Poll device every 1s
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await api.get(`/collar-data/${id}`);
        if (!cancelled) {
          setDevice(res.data);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        } else if (err.response?.status === 404) {
          if (!cancelled) setError("Device not found");
        } else {
          if (!cancelled) setError("Failed to load device");
        }
      }
    };

    // initial load
    load();
    // poll every 1s
    const intervalId = setInterval(load, 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [id, navigate]);

  const hasLocation =
    device && device.lastLocation && device.lastLocation.lat && device.lastLocation.lon;

  if (error) {
    return (
      <>
        <div className="page-header">
          <div>
            <div className="page-title">Device detail</div>
          </div>
          <div>
            <Link to="/devices" className="table-link">
              ← Back to devices
            </Link>
          </div>
        </div>
        <p style={{ color: "#f97373" }}>{error}</p>
      </>
    );
  }

  if (!device) {
    return (
      <>
        <div className="page-header">
          <div>
            <div className="page-title">Device detail</div>
          </div>
          <div>
            <Link to="/devices" className="table-link">
              ← Back to devices
            </Link>
          </div>
        </div>
        <p>Loading...</p>
      </>
    );
  }

  const lat = device.lastLocation?.lat;
  const lon = device.lastLocation?.lon;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Device {device._id || id}</div>
          <div className="page-subtitle">
            Detailed view for this collar / tracking device (auto-refreshing every 1s).
          </div>
        </div>
        <div>
          <Link to="/devices" className="table-link">
            ← Back to devices
          </Link>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-card">
          <h2>Overview</h2>
          <div className="detail-grid">
            <div>
              <div className="detail-item-label">Status</div>
              <div className="detail-item-value">
                {device.status || "unknown"}
              </div>
            </div>
            <div>
              <div className="detail-item-label">Last seen</div>
              <div className="detail-item-value">
                {device.lastSeen
                  ? new Date(device.lastSeen).toLocaleString()
                  : "N/A"}
              </div>
            </div>
            <div>
              <div className="detail-item-label">Latitude</div>
              <div className="detail-item-value">
                {lat ?? "N/A"}
              </div>
            </div>
            <div>
              <div className="detail-item-label">Longitude</div>
              <div className="detail-item-value">
                {lon ?? "N/A"}
              </div>
            </div>
          </div>

          <div className="detail-json">
            <pre>{JSON.stringify(device, null, 2)}</pre>
          </div>
        </div>

        <div className="detail-card">
          <h2>Location map</h2>
          {hasLocation ? (
            <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden" }}>
              <MapContainer
                center={[lat, lon]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lon]} icon={deviceIcon}>
                  <Popup>
                    Device {device._id || id}
                    <br />
                    Lat: {lat}
                    <br />
                    Lon: {lon}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <p>No valid lastLocation for this device.</p>
          )}
        </div>
      </div>
    </>
  );
}
