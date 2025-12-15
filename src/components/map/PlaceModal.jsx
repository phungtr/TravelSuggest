// src/components/map/PlaceModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import './PlaceModal.css';

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const FALLBACK_IMG =
  "data:image/svg+xml;utf8,\
  <svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'>\
    <rect width='100%' height='100%' fill='#f2f2f2'/>\
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' \
      fill='#999' font-family='Arial' font-size='24'>Không có ảnh</text>\
  </svg>";

export default function PlaceModal({
  open,
  onClose,
  place,                
  userLocation,          
  onRoute,               
  onToggleFavorite,      
  isFavorite,  
  defaultComments,
  user ,
  averageRating        
}) {
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState("");       
  const [coords, setCoords] = useState(null); 
  const [extras, setExtras] = useState({});   
  const [photo, setPhoto] = useState(FALLBACK_IMG);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleComments = comments.slice(0, visibleCount);
  const title = place?.name || "Địa điểm";
  const [newRating, setNewRating] = useState(0); 

  useEffect(() => {
    if (!place?.id) return;

    const saved = localStorage.getItem(`comments-${place.id}`);
    if (saved) {
      setComments(JSON.parse(saved));
    } else {
      setComments(defaultComments[place.id] || []);
    }
  }, [place, defaultComments]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const sentiment = classifySentiment(newComment);

    const newEntry = {
      user: user?.username || "Khách",
      text: newComment.trim(),
      rating: newRating,
      sentiment,
      time: new Date().toISOString()
    };

    const updated = [...comments, newEntry];
    setComments(updated);
    localStorage.setItem(`comments-${place.id}`, JSON.stringify(updated));
    setNewComment("");
    setNewRating(0);
  };

  function classifySentiment(text) {
    const positiveWords = ["ngon", "tốt", "sạch", "yên tĩnh", "hài lòng", "tuyệt vời", "đẹp"];
    const negativeWords = ["tệ", "chậm", "ồn", "bẩn", "không hài lòng", "dở"];

    const lower = text.toLowerCase();
    if (positiveWords.some(w => lower.includes(w))) return "positive";
    if (negativeWords.some(w => lower.includes(w))) return "negative";
    return "neutral";
  }

  useEffect(() => {
    if (!open || !place) return;

    let aborted = false;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setPhoto(FALLBACK_IMG); // Reset photo on new place

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(place.name)}` +
          `&format=json&limit=1&addressdetails=1&namedetails=1&extratags=1`
        );
        const data = await res.json();
        if (!aborted && Array.isArray(data) && data.length > 0) {
          const item = data[0];
          setAddr(item.display_name || "");
          setCoords({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) });

          const extra = item.extratags || {};
          setExtras({
            opening_hours: extra.opening_hours || "",
            phone: extra.phone || extra.contact_phone || "",
            website: extra.website || "",
          });
        }

        const wiki = await fetch(
          `https://vi.wikipedia.org/w/api.php?` +
            `action=query&generator=search&gsrsearch=${encodeURIComponent(place.name)}` +
            `&prop=pageimages|info&inprop=url&piprop=thumbnail&pithumbsize=800` +
            `&format=json&origin=*`
        );
        const wikiData = await wiki.json();
        if (!aborted && wikiData?.query?.pages) {
          const pages = Object.values(wikiData.query.pages);
          const firstWithThumb = pages.find(p => p.thumbnail && p.thumbnail.source);
          if (firstWithThumb) {
            setPhoto(firstWithThumb.thumbnail.source);
          }
        }
      } catch (e) {
        console.error("Error fetching place details:", e);
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    fetchDetails();
    return () => { aborted = true; };
  }, [open, place]);

    const distanceLabel = useMemo(() => {
    if (coords && userLocation) {
        const d = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        coords.lat,
        coords.lng
        );
        return `${d.toFixed(1)} km`;
    }
    return place?.distance ? `${place.distance.toFixed(1)} km` : "—";
    }, [coords, userLocation, place]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-photo">
            <img src={photo} alt={title} />
            {loading && <div className="modal-loading">Đang tải...</div>}
          </div>

          <div className="modal-info">
            <div className="modal-row">
                <span className="modal-label">Danh mục:</span>
                <span className="modal-value">{place?.category || "—"}</span>
            </div>
            <div className="modal-row"> 
              <span className="modal-label">Đánh giá:</span>
              <span className="modal-value">{averageRating} ⭐</span>
            </div>
            <div className="modal-row">
                <span className="modal-label">Khoảng cách:</span>
                <span className="modal-value">{distanceLabel || "—"}</span>
            </div>
            <div className="modal-row">
                <span className="modal-label">Địa chỉ:</span>
                <span className="modal-value">{addr || "Đang cập nhật..."}</span>
            </div>
            {(extras.opening_hours || extras.phone || extras.website) && (
              <>
                <div className="modal-divider" />
                {extras.opening_hours && (
                  <div className="modal-row">
                    <span className="modal-label">Giờ mở cửa:</span>
                    <span className="modal-value">{extras.opening_hours}</span>
                  </div>
                )}
                {extras.phone && (
                  <div className="modal-row">
                    <span className="modal-label">Điện thoại:</span>
                    <span className="modal-value">{extras.phone}</span>
                  </div>
                )}
                {extras.website && (
                  <div className="modal-row">
                    <span className="modal-label">Website:</span>
                    <a className="modal-value link" href={extras.website} target="_blank" rel="noreferrer">
                      {extras.website}
                    </a>
                  </div>
                )}
              </>
            )}          
            <div className="modal-comments">
                <h4>Bình luận của du khách</h4>
                <div className="comment-container">
                    <ul className="comment-list">  
                        {visibleComments.map((c, idx) => (
                        <li key={idx} className={`comment-${c.sentiment}`}>
                            <strong>{c.user}</strong>: {c.text}
                            <br />
                            <span>⭐ {c.rating} • {new Date(c.time).toLocaleString()}</span>
                        </li>
                        ))}
                    </ul>
                </div>
                {visibleCount < comments.length && (
                    <button className="view-more-btn" onClick={() => setVisibleCount(prev => prev + 3)}>
                    Xem thêm bình luận
                    </button>
                )}
                {visibleCount > 3 && (
                    <button className="view-more-btn" onClick={() => setVisibleCount(3)}>
                    Ẩn bớt
                    </button>
                )}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                />
                <div className="rating-select">
                    {Array.from({ length: 5 }, (_, i) => (
                    <span
                        key={i}
                        onClick={() => setNewRating(i + 1)}
                        className={`star-rating ${newRating >= i + 1 ? 'selected' : ''}`}
                    >
                        ★
                    </span>
                    ))}
                </div>
                <button className="submit-comment-btn" onClick={handleAddComment}>Gửi bình luận</button>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="go-btn"
            onClick={() => onRoute(place.name)}
            title="Chỉ đường tới địa điểm này"
          >
            🚗 Chỉ đường
          </button>
          <button
            className={`fav-btn ${isFavorite ? "active" : ""}`}
            onClick={() => onToggleFavorite(place)}
            title="Thêm/Bỏ yêu thích"
          >
            {isFavorite ? "❤️ Đã yêu thích" : "♡ Yêu thích"}
          </button>
        </div>
      </div>
    </div>
  );
}