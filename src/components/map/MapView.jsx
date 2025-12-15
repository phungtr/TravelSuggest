// src/components/map/MapView.jsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geometryutil";
import { fetchRoute } from "./DirectionsAPI";
import "./MapView.css";

// Icon đỏ cho các địa điểm được AI đề xuất
const aiIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapView = ({ start, end, recommendedPlaces, onClose }) => {
  const mapRef = useRef(null);
  const routeLayersRef = useRef([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mode, setMode] = useState("car");
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const startEndMarkersRef = useRef([]);
  const aiMarkersRef = useRef([]);
  const routeColors = ["#4285F4", "#34A853", "#FBBC05"];

  const getSpeedByMode = (mode) => {
    switch (mode) {
      case "car":
        return 65 / 3.6;
      case "bike":
        return 18 / 3.6;
      case "motorbike":
        return 40 / 3.6;
      case "walking":
      default:
        return 5 / 3.6;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 1) return "<1p";
    if (minutes < 60) return `${minutes}p`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hrs} giờ` : `${hrs} giờ ${mins}p`;
  };

  const getRouteLabel = (route, idx) => {
    const segments = route?.segments?.[0]?.steps || [];
    const firstRoad = segments.find((s) => s.road)?.road;
    return firstRoad ? `Qua ${firstRoad}` : `Tuyến ${idx + 1}`;
  };

  useEffect(() => {
    if (mapRef.current && mapRef.current._leaflet_id) {
      mapRef.current.remove();
    }

    const map = L.map("map").setView([21.0285, 105.8542], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    map.createPane("routePane");
    map.getPane("routePane").style.zIndex = 450;

    map.createPane("borderPane");
    map.getPane("borderPane").style.zIndex = 440;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;

        const currentMap = mapRef.current;
        if (!currentMap || !currentMap._panes) return;

        const marker = L.marker([latitude, longitude]).addTo(currentMap);
        marker.bindPopup("Vị trí của bạn").openPopup();
        currentMap.setView([latitude, longitude], 14);
      });
    }
  }, []);

  useEffect(() => {
    if (!start || !end) {
        const map = mapRef.current;
        if (map) {
            routeLayersRef.current.forEach(({ routeLine, borderLine }) => {
                map.removeLayer(routeLine);
                map.removeLayer(borderLine);
            });
            startEndMarkersRef.current.forEach(m => map.removeLayer(m));
        }
        routeLayersRef.current = [];
        startEndMarkersRef.current = [];
        setRouteInfo(null);
        setRoutes([]);
        return;
    }

    const map = mapRef.current;
    setLoading(true);

    startEndMarkersRef.current.forEach(m => map.removeLayer(m));
    startEndMarkersRef.current = [];

    const startMarker = L.marker([start.lat, start.lng]).addTo(map);
    const endMarker = L.marker([end.lat, end.lng]).addTo(map);
    startEndMarkersRef.current.push(startMarker, endMarker);
    fetchRoute(start, end, mode)
      .then((routesData) => {
        routeLayersRef.current.forEach(({ routeLine, borderLine }) => {
          map.removeLayer(routeLine);
          map.removeLayer(borderLine);
        });
        routeLayersRef.current = [];

        routesData.forEach((route, idx) => {
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat,lng]);
          const isSelected = idx === 0;
          const borderLine = L.polyline(coords, { color: "#000", weight: isSelected ? 8 : 6, opacity: isSelected ? 0.5 : 0.3, pane: "borderPane" }).addTo(map);
          const routeLine = L.polyline(coords, { color: routeColors[idx % routeColors.length], weight: isSelected ? 6 : 3, opacity: isSelected ? 1 : 0.4, pane: "routePane" }).addTo(map);
          routeLayersRef.current.push({ routeLine, borderLine });
          const dist = L.GeometryUtil.length(routeLine);
          const label = getRouteLabel(route, idx);
          routeLine.bindPopup(`<b>${label}</b><br/>${(dist / 1000).toFixed(2)} km • ${formatTime(route.summary.duration)}`);
        });

        const mainRoute = routesData[0];
        const mainCoords = mainRoute.geometry.coordinates.map(([lng, lat]) => [lat,lng]);
        map.fitBounds(L.polyline(mainCoords).getBounds());

        setRoutes(routesData);
        setSelectedRouteIndex(0);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy tuyến:", err);
        alert("Không thể lấy tuyến đường. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [start, end, mode]);

  // *** BẮT ĐẦU SỬA LỖI ***
  useEffect(() => {
    // Thêm điều kiện !start || !end để ngăn lỗi
    if (!start || !end || routes.length === 0 || routeLayersRef.current.length === 0) {
        return;
    }
  // *** KẾT THÚC SỬA LỖI ***

    routeLayersRef.current.forEach(({ routeLine, borderLine }, idx) => {
      const isSelected = idx === selectedRouteIndex;
      routeLine.setStyle({ weight: isSelected ? 6 : 3, opacity: isSelected ? 1 : 0.4 });
      borderLine.setStyle({ weight: isSelected ? 8 : 6, opacity: isSelected ? 0.5 : 0.3 });
    });

    const selectedRoute = routes[selectedRouteIndex];
    const distance = selectedRoute.summary.distance;
    const allDurations = {
      walking: formatTime(distance / getSpeedByMode("walking")),
      bike: formatTime(distance / getSpeedByMode("bike")),
      motorbike: formatTime(distance / getSpeedByMode("motorbike")),
      car: formatTime(distance / getSpeedByMode("car")),
    };

    setRouteInfo({
      startAddress: start.fullAddress || "Vị trí bắt đầu",
      endAddress: end.fullAddress || "Điểm đến",
      distance: (distance / 1000).toFixed(2),
      duration: allDurations[mode],
      allDurations,
      mode,
    });
  }, [selectedRouteIndex, mode, routes, start, end]);


  useEffect(() => {
    const map = mapRef.current;
    if (!map || !recommendedPlaces || recommendedPlaces.length === 0) {
      return;
    }
    aiMarkersRef.current.forEach(m => map.removeLayer(m));
    aiMarkersRef.current = [];
    recommendedPlaces.forEach((place) => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], { icon: aiIcon }).addTo(map);
        marker.bindPopup(`<b>Gợi ý AI:</b><br/>${place.name || "Không rõ"}<br/>${place.location || ""}`);
        aiMarkersRef.current.push(marker);
      }
    });
  }, [recommendedPlaces]);


  return (
    <>
      <div id="map" style={{ height: "100%", width: "100%" }}></div>
      {loading && <div className="loading">Đang tải tuyến đường...</div>}
      {routeInfo && (
        <div className="route-info-box">
          <button className="close-route-btn" onClick={onClose}>×</button>
          <div className="transport-selector">
            <h4>🚗 Chọn phương tiện</h4>
            {["walking", "bike", "motorbike", "car"].map((m) => (
              <button key={m} className={`mode-button ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>
                {m === "walking" && (
                    <>
                        <span className="mode-icon">🚶</span>
                        <span className="mode-label">Đi bộ</span>
                    </>
                )}
                {m === "bike" && (
                    <>
                        <span className="mode-icon">🚲</span>
                        <span className="mode-label">Xe đạp</span>
                    </>
                )}
                {m === "motorbike" && (
                    <>
                        <span className="mode-icon">🏍️</span>
                        <span className="mode-label">Xe máy</span>
                    </>
                )}
                {m === "car" && (
                    <>
                        <span className="mode-icon">🚗</span>
                        <span className="mode-label">Ô tô</span>
                    </>
                )}
              </button>
            ))}
          </div>
          <div className="route-summary">
            <h4>📍 Thông tin tuyến</h4>
            <div className="route-line">
              <span className="circle">●</span>
              <input type="text" value={routeInfo.startAddress} readOnly />
            </div>
            <div className="route-line">
              <span className="circle end">⭳</span>
              <input type="text" value={routeInfo.endAddress} readOnly />
            </div>
            <p><strong>Khoảng cách:</strong> {routeInfo.distance} km</p>
            <p><strong>Thời gian dự kiến:</strong> {routeInfo.duration}</p>
          </div>
          {routes.length > 1 && (
            <div className="route-selector">
              <h4>🛣️ Chọn tuyến đường</h4>
              {routes.map((route, idx) => (
                <button
                  key={idx}
                  className={`route-button ${idx === selectedRouteIndex ? "active" : ""}`}
                  onClick={() => setSelectedRouteIndex(idx)}
                  style={{ borderLeftColor: routeColors[idx % routeColors.length] }}
                >
                  {getRouteLabel(route, idx)}{" "}
                  <span>
                    {(route.summary.distance / 1000).toFixed(2)} km •{" "}
                    {formatTime(route.summary.duration)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MapView;