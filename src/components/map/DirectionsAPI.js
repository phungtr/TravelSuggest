export async function fetchRoute(start, end, mode = "car") {
  if (
    !start || !end ||
    typeof start.lat !== "number" || typeof start.lng !== "number" ||
    typeof end.lat !== "number" || typeof end.lng !== "number"
  ) {
    throw new Error("Tọa độ không hợp lệ");
  }

  const profileMap = {
    car: "driving-car",
    motorbike: "driving-car", 
    bike: "cycling-regular",
    walking: "foot-walking"
  };

  const profile = profileMap[mode] || "driving-car";
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjhkMjE2OGUyYzU2ZDRhNzRiZDBhNTFlODRiY2YzMTFmIiwiaCI6Im11cm11cjY0In0=";
  const url = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

  const coordinates = [
    [parseFloat(start.lng), parseFloat(start.lat)],
    [parseFloat(end.lng), parseFloat(end.lat)]
  ];

  const preferences = ["fastest", "shortest", "recommended"];
  const results = [];

  for (const pref of preferences) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coordinates, preference: pref })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.features?.length > 0) {
        results.push({
          preference: pref,
          geometry: data.features[0].geometry,
          summary: data.features[0].properties.summary,
          segments: data.features[0].properties.segments
        });
      }
    } else {
      const errorText = await response.text();
      console.warn(`Lỗi với preference "${pref}":`, errorText);
    }
  }

  const uniqueRoutes = results.filter((route, idx, arr) =>
    !arr.slice(0, idx).some(other =>
      JSON.stringify(route.geometry.coordinates) === JSON.stringify(other.geometry.coordinates)
    )
  );

  if (uniqueRoutes.length === 0) throw new Error("Không tìm được đường đi");

  return uniqueRoutes;
}
