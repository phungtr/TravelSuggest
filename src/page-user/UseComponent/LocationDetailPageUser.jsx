// src/page-user/UseComponent/LocationDetailPageUser.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { de, vi } from 'date-fns/locale';
import {
    FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGlobe, FaPhone,
    FaTag, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle,
    FaTimesCircle, FaPlayCircle, FaStar, FaImage
} from 'react-icons/fa';
import Swal from 'sweetalert2'; // Import Swal
import { haversineDistance, toSlug } from '../UserDashboard';
import {
    getActiveReviewsAndAverageRating,
    getAverageRating,
    toggleFavorite, getFavorites, writeReview,
    getCurrentUser, getLocationDetail,
    logDirectionRequest
} from '../../services/api';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LocationDetailPageUser.css';

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/dduv5y00x/image/upload/v1725091761/image_default_profile.jpg";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const InfoCard = ({ title, children }) => (
    <div className="info-card">
        <h3 className="info-card__title">{title}</h3>
        <div className="info-card__content">
            {children}
        </div>
    </div>
);

const InfoRow = ({ icon, label, children }) => (
    <div className="info-row">
        <span className="info-row__icon">{icon}</span>
        <span className="info-row__label">{label}:</span>
        <span className="info-row__value">{children}</span>
    </div>
);

const StarRating = ({ rating }) => (
    <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < rating ? "star-filled" : "star-empty"} />
        ))}
    </div>
);

export default function LocationDetailPageUser() {
    const { locationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userLocation } = location.state || {};
    const [details, setDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [newImages, setNewImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);


    const calculatedDistance = useMemo(() => {
        if (userLocation && details && details.latitude && details.longitude) {
            return haversineDistance(
                userLocation.lat,
                userLocation.lng,
                details.latitude,
                details.longitude
            );
        }
        return null;
    }, [userLocation, details]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user.data || user);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            }
        };
        fetchUserProfile();
    }, []);

    const checkFavoriteStatus = useCallback(async () => {
        try {
            const favsRes = await getFavorites();
            const favoritesList = favsRes.data || [];
            const currentId = parseInt(locationId, 10);
            const isFav = favoritesList.some(fav => fav.locationId === currentId);
            setIsFavorite(isFav);
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        }
    }, [locationId]);

    const handleToggleFavorite = useCallback(async () => {
        try {
            await toggleFavorite(locationId);
            checkFavoriteStatus();
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
            Swal.fire({
                icon: 'error',
                title: 'Có lỗi xảy ra',
                text: 'Không thể cập nhật trạng thái yêu thích, vui lòng thử lại.',
            });
        }
    }, [locationId, checkFavoriteStatus]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleAddReview = async () => {
        if (!details || !currentUser) {
            Swal.fire({
                icon: 'error',
                title: 'Chưa đăng nhập',
                text: 'Bạn cần đăng nhập để thực hiện chức năng này.',
            });
            return;
        }
        try {
            if (newRating === 0 || newComment === "") {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin',
                    text: 'Vui lòng chọn số sao và viết bình luận trước khi gửi.',
                });
                return;
            }

            await writeReview({
                locationId: locationId,
                rating: newRating,
                comment: newComment,
                userId: currentUser.accountId,
                images: newImages
            });

            Swal.fire({
                icon: 'success',
                title: 'Đã gửi thành công!',
                text: 'Bình luận của bạn đã được gửi và đang chờ duyệt!',
                timer: 2000,
                showConfirmButton: false
            });
            setNewRating(0);
            setNewComment("");
            setNewImages([]);
            setImagePreviews([]);
        } catch (error) {
            console.error("Lỗi khi gửi đánh giá:", error);
            Swal.fire({
                icon: 'error',
                title: 'Gửi thất bại',
                text: `Lỗi: ${error.response?.data?.message || error.message}`,
            });
        }
    };

    const fetchLocationReviews = useCallback(async () => {
        try {
            const reviewsResponse = await getActiveReviewsAndAverageRating(locationId);
            const ratingResponse = await getAverageRating(locationId);
            setReviews(reviewsResponse.data.result || []);
            setAverageRating(ratingResponse.data || 0);
        } catch (e) {
            console.error("Lỗi khi tải reviews và rating:", e);
            setReviews([]);
            setAverageRating(0);
        }
    }, [locationId]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const response = await getLocationDetail(locationId);
                setDetails(response.data);

                fetchLocationReviews();
                checkFavoriteStatus();
            } catch (e) {
                setError(e);
                console.error("Lỗi khi tải chi tiết địa điểm:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [locationId, fetchLocationReviews, checkFavoriteStatus]);

    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Không tìm thấy địa điểm này.</div>;
    if (!details) return <div className="empty-state">Không có dữ liệu chi tiết.</div>;

    const mainImage = details.images?.[0] || "https://via.placeholder.com/1400x300?text=No+Image";

    const handleRoute = async () => {
        if (userLocation && details?.latitude && details?.longitude) {
            try {
                if (locationId) {
                    await logDirectionRequest(locationId);
                }
            } catch (error) {
                console.error("Failed to log direction request:", error);
            }

            const startPoint = {
                lat: userLocation.lat,
                lng: userLocation.lng,
                fullAddress: userLocation.fullAddress || "Vị trí của bạn",
            };
            const endPoint = {
                lat: details.latitude,
                lng: details.longitude,
                fullAddress: details.name ? `${details.name} - ${details.location}` : details.location,
            };
            const newHistoryItem = {
                name: details.name,
                address: endPoint.fullAddress,
                lat: endPoint.lat,
                lng: endPoint.lng
            };
            const existingHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
            const filteredHistory = existingHistory.filter(item => 
                item.lat !== newHistoryItem.lat || item.lng !== newHistoryItem.lng
            );
            const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 10);
            localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
            navigate('/user/dashboard', {
                state: {
                    routeFromDetail: {
                        start: startPoint,
                        end: endPoint,
                    }
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu thông tin',
                text: 'Không thể lấy thông tin vị trí của bạn hoặc của địa điểm để chỉ đường.',
            });
        }
    };

    return (
        <div className="location-detail-page">
            <div
                className="detail-header"
                style={{ backgroundImage: `url(${mainImage})` }}
            >
                <button className="back-btn" onClick={() => navigate(-1)}>← Quay lại</button>
                <div className="detail-header__overlay">
                    <h1 className="detail-header__title">{details.name}</h1>
                    <p className="detail-header__address"><FaMapMarkerAlt /> {details.location}</p>
                </div>
            </div>

            <div className="detail-content">
                <div className="main-info">
                    <InfoCard title="Thông tin cơ bản">
                        <InfoRow icon={<FaTag />} label="Thể loại">{details.categoryNames?.join(', ') || "N/A"}</InfoRow>
                        <InfoRow icon={<FaClock />} label="Giờ mở cửa">{details.openTime && details.closeTime ? `${details.openTime} - ${details.closeTime}` : "Chưa cập nhật"}</InfoRow>
                        <InfoRow icon={<FaMoneyBillWave />} label="Giá vé">{details.price ? `${details.price.toLocaleString('vi-VN')} VNĐ` : "Miễn phí"}</InfoRow>
                        <InfoRow icon={<FaGlobe />} label="Website">
                            {details.website ? (
                                <a href={details.website} target="_blank" rel="noopener noreferrer">
                                    {details.website} <FaExternalLinkAlt size={12} />
                                </a>
                            ) : "Chưa cập nhật"}
                        </InfoRow>
                        <InfoRow icon={<FaPhone />} label="Điện thoại">{details.phoneNumber || "Chưa cập nhật"}</InfoRow>
                        {userLocation && (
                            <InfoRow icon={<FaMapMarkerAlt />} label="Khoảng cách">
                                {calculatedDistance !== null ? `${calculatedDistance.toFixed(1)} km` : "Đang tính..."}
                            </InfoRow>
                        )}
                    </InfoCard>

                    <InfoCard title="Mô tả">
                        <p className="description">{details.description}</p>
                    </InfoCard>

                    <InfoCard title="Bản đồ">
                        {details.latitude && details.longitude && (
                            <MapContainer
                                center={[details.latitude, details.longitude]}
                                zoom={15}
                                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[details.latitude, details.longitude]}>
                                    <Popup>{details.name}</Popup>
                                </Marker>
                            </MapContainer>
                        )}
                    </InfoCard>

                    <div className="user-actions">
                        <button
                            className={`favorite-btn ${isFavorite ? "active" : ""}`}
                            onClick={handleToggleFavorite}
                        >
                            {isFavorite ? "❤️ Đã yêu thích" : "♡ Yêu thích"}
                        </button>
                        <button
                            className="go-btn"
                            onClick={handleRoute}
                            disabled={!userLocation}
                            title={!userLocation ? "Vui lòng cho phép định vị để chỉ đường" : "Chỉ đường tới địa điểm này"}
                        >
                            🚗 Chỉ đường
                        </button>
                    </div>

                    <InfoCard title="Ảnh & Video">
                        <div className="media-gallery">
                            {details.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={details.name}
                                    className="media-thumbnail"
                                    onClick={() => setSelectedMedia({ type: 'image', url: img })}
                                />
                            ))}
                        </div>
                    </InfoCard>

                    <InfoCard title="Đánh giá & Bình luận">
                        <div className="average-rating-display">
                            <h3>
                                <StarRating rating={Math.round(averageRating)} />
                                {averageRating.toFixed(1)} / 5.0
                            </h3>
                        </div>

                        <div className="review-form">
                            <h4>Viết đánh giá của bạn</h4>
                            <div className="rating-input">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={i < newRating ? "star-filled" : "star-empty"}
                                        onClick={() => setNewRating(i + 1)}
                                        style={{ cursor: "pointer" }}
                                    />
                                ))}
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận của bạn tại đây..."
                                rows="3"
                            />
                            <div className="image-upload-container">
                                <label htmlFor="review-image-upload" className="image-upload-label">
                                    <FaImage className="upload-icon" /> Thêm ảnh
                                </label>
                                <input
                                    type="file"
                                    id="review-image-upload"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="image-previews">
                                    {imagePreviews.map((image, index) => (
                                        <img key={index} src={image} alt={`Ảnh xem trước ${index + 1}`} className="preview-image" />
                                    ))}
                                </div>
                            )}

                            <button className="submit-review-btn" onClick={handleAddReview}>
                                Gửi đánh giá
                            </button>
                        </div>

                        <div className="review-list">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <div key={review.reviewId} className="review-item">
                                        <div className="review-item__header">
                                            <div className="review-author-info">
                                                <img
                                                    src={review.avatar || DEFAULT_AVATAR_URL}
                                                    alt={review.username}
                                                    className="review-author-avatar"
                                                />
                                                <span className="user-name">{review.username}</span>
                                            </div>
                                            <span className="review-date">
                                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                        <div className="review-item__rating">
                                            <StarRating rating={review.rating} />
                                        </div>

                                        <p className="review-item__comment">{review.comment}</p>

                                        {review.images?.length > 0 && (
                                            <div className="review-item__images">
                                                {review.images.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image}
                                                        alt={`Ảnh đánh giá ${index + 1}`}
                                                        className="review-image"
                                                        onClick={() => setSelectedMedia({ url: image, type: 'image' })}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {review.response && (
                                            <div className="review-response">
                                                <strong>Phản hồi từ quản lý:</strong> {review.response}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có đánh giá nào cho địa điểm này.</p>
                            )}
                        </div>
                    </InfoCard>

                    {selectedMedia && (
                        <div className="media-modal-overlay" onClick={() => setSelectedMedia(null)}>
                            <div className="media-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                                {selectedMedia.type === 'image' ? (
                                    <img src={selectedMedia.url} alt="Xem ảnh lớn" className="media-modal-content" />
                                ) : (
                                    <video src={selectedMedia.url} controls autoPlay className="media-modal-content" />
                                )}
                            </div>
                            <button className="media-modal-close" onClick={() => setSelectedMedia(null)}>×</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}