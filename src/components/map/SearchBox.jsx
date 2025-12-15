import React, { useEffect, useState } from "react";
import "./SearchBox.css";

const SearchBox = ({ onSearch, setStart, query, setQuery }) => {
  const [currentPos, setCurrentPos] = useState(null);

  useEffect(() => {
    const fetchCurrentPosition = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
            );
            const data = await res.json();
            const address =
              data.display_name ||
              data.address?.suburb ||
              data.address?.city ||
              data.address?.county ||
              data.address?.state ||
              "Vị trí hiện tại";

            const coord = {
              lat,
              lng,
              fullAddress: address,
            };
            setStart(coord);
            setCurrentPos(coord);
          } catch (err) {
            const fallback = {
              lat,
              lng,
              fullAddress: "Vị trí hiện tại",
            };
            setStart(fallback);
            setCurrentPos(fallback);
          }
        });
      }
    };
    fetchCurrentPosition();
  }, [setStart]);

  const fetchCoords = async (place) => {
    if (place.includes(",")) {
      const [latRaw, lngRaw] = place.split(",").map(str => str.trim());
      const lat = parseFloat(latRaw);
      const lng = parseFloat(lngRaw);

      if (isNaN(lat) || isNaN(lng)) throw new Error("Tọa độ không hợp lệ");

      const reverse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const reverseData = await reverse.json();

      return {
        lat,
        lng,
        fullAddress: reverseData.display_name || "Tọa độ cụ thể"
      };
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`);
    const data = await res.json();
    if (data.length === 0) throw new Error("Không tìm thấy địa điểm");

    const { lat, lon, display_name } = data[0];
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lon);

    const reverse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latNum}&lon=${lngNum}&format=json`);
    const reverseData = await reverse.json();

    return {
      lat: latNum,
      lng: lngNum,
      fullAddress: `${place} - ${reverseData.display_name || display_name || "Không rõ vị trí"}`
    };
  };

  const handleSearch = async () => {
    try {
      const endCoord = await fetchCoords(query.trim());
      if (!currentPos || isNaN(currentPos.lat) || isNaN(currentPos.lng)) {
        throw new Error("Không xác định được vị trí hiện tại");
      }

      const startCoord = {
        lat: parseFloat(currentPos.lat),
        lng: parseFloat(currentPos.lng),
        fullAddress: currentPos.fullAddress
      };

      onSearch(startCoord, endCoord);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="search-box">
      <input
        type="text"
        className="search-bar"
        placeholder="Nhập tên địa điểm để chỉ đường"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
      <button className="search-btn" onClick={handleSearch}>➔</button>
    </div>
  );
};

export default SearchBox;
