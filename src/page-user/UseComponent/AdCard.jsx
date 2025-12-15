import React from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toSlug } from "../UserDashboard";
const getShortAddress = (fullAddress) => {
    if (!fullAddress) return "Không rõ vị trí";


    const parts = fullAddress.split(',').map(part => part.trim());

    if (parts.length < 3) return fullAddress;

    const city = parts[parts.length - 1]; // Thành phố
    const district = parts[parts.length - 2];
    let streetOrAlley = parts.length > 3 ? parts[parts.length - 4] : parts[0];

    // Đảm bảo phần đường/ngõ ngắn gọn
    if (streetOrAlley.length > 30) {
        streetOrAlley = parts[0];
    }

    const shortAddress = `${streetOrAlley}, ${district}, ${city}`;

    return shortAddress.length > 50 ? `${streetOrAlley}, ${district}` : shortAddress;
};
// Bỏ prop 'onCall' và chỉ giữ lại các prop cần thiết
const AdCard = ({ ad, onRoute, onNavigate, userLocation }) => {
    const handleRouteClick = (e) => {
        e.stopPropagation();
        onRoute(ad);
    };

    const handleCallClick = (e) => {
        e.stopPropagation(); 
        if (ad.locationPhoneNumber) {
            window.location.href = `tel:${ad.locationPhoneNumber}`;
        } else {
            alert("Địa điểm này hiện chưa cung cấp số điện thoại.");
        }
    };

    const handleCardClick = () => {
        if (ad.locationId) {
            const slug = toSlug(ad.locationName);
            onNavigate(`/location/${ad.locationId}/${slug}`, { state: { userLocation } });
        }
    };

    return (
        <div className="ad-card-v2" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <span className="ad-card__tag">Quảng cáo</span>
            <div className="ad-card__main-content">
                <img
                    src={ad.locationImages?.[0] || "https://placehold.co/64x64/e2e8f0/64748b?text=Ảnh"}
                    alt={ad.locationName}
                    className="ad-card__image"
                />
                <div className="ad-card__info">
                    <h4>{ad.locationName}</h4>
                    <p className="ad-card__slogan">"{ad.title}"</p>
                    <div className="ad-card__details" >
                        <div className='ad-card__details_left'>
                            <span className="ad-card__rating">
                                <FaStar style={{ color: '#f59e0b' }} />
                                {ad.averageRating ? ad.averageRating.toFixed(1) : 'N/A'}
                            </span>
                            <span className="ad-card__review-count">
                                &nbsp;({ad.totalReviews || 0} đánh giá)
                            </span>
                        </div>
                        <span className="ad-card__address">
                            <FaMapMarkerAlt /> {getShortAddress(ad.locationAddress)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="ad-card__actions">
                {ad.actions && ad.actions.includes('GUIDE') && (
                    <button className="ad-card__btn ad-card__btn--primary" onClick={handleRouteClick}>
                        Chỉ đường
                    </button>
                )}
                {ad.actions && ad.actions.includes('CALL') && (
                    <button className="ad-card__btn ad-card__btn--secondary" onClick={handleCallClick}>
                        Gọi ngay
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdCard;