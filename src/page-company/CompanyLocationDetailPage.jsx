// src/page-company/CompanyLocationDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGlobe, FaPhone,
    FaTag, FaPlayCircle, FaStar, FaExternalLinkAlt // Thêm FaExternalLinkAlt vào đây
} from 'react-icons/fa';
import { getLocationDetail, getAllReviews } from '../services/api';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import '../page-staff/LocationDetailPage.css';

// --- Sửa lỗi icon ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- Helper Components ---
const InfoCard = ({ title, children }) => (
    <div className="info-card">
        <h3 className="info-card__title">{title}</h3>
        <div className="info-card__content">{children}</div>
    </div>
);

const InfoRow = ({ icon, label, value, isLink = false, children }) => {
    if (!value && !children) return null;
    return (
        <div className="info-row">
            <div className="info-row__icon">{icon}</div>
            <div className="info-row__text">
                <span className="info-row__label">{label}</span>
                {children ? (
                    <div className="info-row__value">{children}</div>
                ) : isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="info-row__value info-row__link">
                        {value} <FaExternalLinkAlt size={12} />
                    </a>
                ) : (
                    <span className="info-row__value">{value}</span>
                )}
            </div>
        </div>
    );
};

const getMediaType = (url) => {
    if (typeof url !== 'string' || !url) return 'image';
    const lowercasedUrl = url.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg'];
    if (videoExtensions.some(ext => lowercasedUrl.endsWith(ext))) return 'video';
    return 'image';
};

const ReviewItem = ({ review, onImageClick }) => {
    const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi });
    const authorInitial = review.username ? review.username.charAt(0) : '?';

    return (
        <div className="review-item">
            <div className="review-item__avatar">{authorInitial}</div>
            <div className="review-item__content">
                <div className="review-item__header">
                    <span className="review-item__author">{review.username}</span>
                    <span className="review-item__timestamp">{timeAgo}</span>
                </div>
                <div className="review-item__rating">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} color={i < review.rating ? '#f59e0b' : '#e5e7eb'} />
                    ))}
                </div>
                <p className="review-item__comment">{review.comment}</p>
                
                {review.images && review.images.length > 0 && (
                    <div className="review-item__images">
                        {review.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Ảnh đánh giá ${index + 1}`}
                                className="review-item__image-thumbnail"
                                onClick={() => onImageClick(img)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Component ---
export default function CompanyLocationDetailPage() {
    const { locationId } = useParams();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedReviewImage, setSelectedReviewImage] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [locationReviews, setLocationReviews] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [detailsRes, allReviewsRes] = await Promise.all([
                getLocationDetail(locationId),
                getAllReviews()
            ]);
            
            const locationData = detailsRes.data;
            setDetails(locationData);

            if (locationData?.latitude && locationData?.longitude) {
                setCoordinates([locationData.latitude, locationData.longitude]);
            }

            if (allReviewsRes.data && locationData) {
                const reviewsForLocation = allReviewsRes.data.filter(
                    review => review.locationName === locationData.name && review.status === 'ACTIVE'
                );
                setLocationReviews(reviewsForLocation);
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải chi tiết địa điểm.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [locationId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div className="loading-state">Đang tải chi tiết...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;
    if (!details) return <div className="empty-state">Không tìm thấy thông tin.</div>;

    console.log("Dữ liệu chi tiết:", details);
    const mediaItems = details.images || [];
    const firstImage = mediaItems.find(mediaUrl => getMediaType(mediaUrl) === 'image');
    const coverImage = firstImage || '/images/default-location-image.png';

    return (
        <div className="location-detail-page">
            <div className="detail-header" style={{ backgroundImage: `url(${coverImage})` }}>
                <div className="detail-header__overlay">
                    <h1 className="detail-header__title">{details.name}</h1>
                    <p className="detail-header__address"><FaMapMarkerAlt /> {details.location}</p>
                    {/* KHÔNG CÓ NÚT HÀNH ĐỘNG CHO PHÍA CÔNG TY */}
                </div>
            </div>

            <div className="detail-main-content">
                <div className="detail-content-left">
                    <InfoCard title="Mô tả chi tiết">
                        <p className="location-description">{details.description || "Chưa có mô tả."}</p>
                    </InfoCard>

                    <InfoCard title="Vị trí trên bản đồ">
                        {coordinates ? (
                            <MapContainer center={coordinates} zoom={16} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={coordinates}><Popup>{details.name}</Popup></Marker>
                            </MapContainer>
                        ) : (<p>Địa điểm này chưa có thông tin tọa độ.</p>)}
                    </InfoCard>

                    {mediaItems.length > 0 && (
                        <InfoCard title="Thư viện Hình ảnh & Video">
                            <div className="image-gallery">{mediaItems.map((mediaUrl, index) => { const mediaType = getMediaType(mediaUrl); return (<div key={index} className="gallery-item" onClick={() => setSelectedMedia({ url: mediaUrl, type: mediaType })}>{mediaType === 'video' ? (<div className="gallery-video-wrapper"><video src={mediaUrl} muted playsInline preload="metadata" /><div className="play-icon-overlay"><FaPlayCircle size={40} /></div></div>) : (<img src={mediaUrl} alt={`Media ${index + 1}`} />)}</div>); })}</div>
                        </InfoCard>
                    )}
                    
                    <InfoCard title="Đánh giá từ người dùng">
                        {locationReviews.length > 0 ? (
                            <div className="review-list">
                                {locationReviews.map(review => (
                                    <ReviewItem key={review.reviewId} review={review} onImageClick={setSelectedReviewImage} />
                                ))}
                            </div>
                        ) : (
                            <p>Chưa có đánh giá nào cho địa điểm này.</p>
                        )}
                    </InfoCard>
                </div>

                <div className="detail-content-right">
                    <InfoCard title="Thông tin chung">
                        <InfoRow icon={<FaTag />} label="Danh mục" value={details.categoryNames?.join(', ')} />
                        <InfoRow icon={<FaClock />} label="Giờ hoạt động" value={details.openTime && details.closeTime ? `${details.openTime} - ${details.closeTime}` : "Chưa cập nhật"} />
                        <InfoRow icon={<FaMoneyBillWave />} label="Giá tham khảo" value={details.price ? `${details.price.toLocaleString('vi-VN')} VNĐ` : "Chưa cập nhật"} />
                        <InfoRow icon={<FaPhone />} label="Số điện thoại" value={details.phoneNumber} />
                        <InfoRow icon={<FaGlobe />} label="Website" value={details.website} isLink={true} />
                    </InfoCard>
                </div>
            </div>

            {selectedMedia && (
                <div className="media-modal-overlay" onClick={() => setSelectedMedia(null)}>
                    <div className="media-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.type === 'image' ? (<img src={selectedMedia.url} alt="Xem ảnh lớn" className="media-modal-content" />) : (<video src={selectedMedia.url} controls autoPlay className="media-modal-content" />)}
                    </div>
                    <button className="media-modal-close" onClick={() => setSelectedMedia(null)}>×</button>
                </div>
            )}
            
            {selectedReviewImage && (
                <div className="media-modal-overlay" onClick={() => setSelectedReviewImage(null)}>
                    <div className="media-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedReviewImage} alt="Xem ảnh đánh giá" className="media-modal-content" />
                    </div>
                    <button className="media-modal-close" onClick={() => setSelectedReviewImage(null)}>×</button>
                </div>
            )}
        </div>
    );
}