import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // <-- 1. Thêm import
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGlobe, FaPhone,
    FaUser, FaTag, FaCalendarAlt, FaExternalLinkAlt, FaCheckCircle,
    FaTimesCircle, FaPlayCircle, FaStar, FaPencilAlt
} from 'react-icons/fa';
import { getLocationDetail, approveLocation, rejectLocation, getAllReviews, updateLocation, getAllCategories } from '../services/api';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './LocationDetailPage.css';
import '../page-company/AddLocationPage.css';

// --- Sửa lỗi icon ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- Helper Components ---
const InfoCard = ({ title, children, isEditing }) => (
    <div className="info-card">
        <h3 className="info-card__title">{title}</h3>
        <div className={`info-card__content ${isEditing ? 'editing' : ''}`}>
            {children}
        </div>
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

const StatusBadge = ({ status }) => {
    const statusStyles = {
        PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' },
        ACTIVE: { text: 'Đã duyệt', className: 'status-badge status-active' },
        INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' },
    };
    const statusInfo = statusStyles[status] || { text: status, className: 'status-badge status-default' };
    return <span className={statusInfo.className}>{statusInfo.text}</span>;
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
export default function LocationDetailPage() {
    const { locationId } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedReviewImage, setSelectedReviewImage] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [locationReviews, setLocationReviews] = useState([]);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState(null);
    const [allCategories, setAllCategories] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [detailsRes, allReviewsRes, categoriesRes] = await Promise.all([
                getLocationDetail(locationId),
                getAllReviews(),
                getAllCategories()
            ]);
            
            const locationData = detailsRes.data;
            setDetails(locationData);
            setAllCategories(categoriesRes.data || []);

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

    // <-- 2. Thay thế toàn bộ các hàm xử lý bằng SweetAlert2 -->
    const handleApprove = async () => {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn duyệt địa điểm này?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Duyệt",
            cancelButtonText: "Hủy"
        });
        if (result.isConfirmed) {
            try {
                await approveLocation(locationId);
                await Swal.fire("Thành công!", "Duyệt địa điểm thành công!", "success");
                navigate('/staff/locations');
            } catch (err) {
                Swal.fire("Lỗi!", "Lỗi khi duyệt địa điểm: " + (err.response?.data?.message || err.message), "error");
            }
        }
    };

    const handleReject = async () => {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn từ chối địa điểm này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Từ chối",
            cancelButtonText: "Hủy",
            confirmButtonColor: '#d33'
        });
        if (result.isConfirmed) {
            try {
                await rejectLocation(locationId);
                await Swal.fire("Thành công!", "Từ chối địa điểm thành công!", "success");
                navigate('/staff/locations');
            } catch (err) {
                Swal.fire("Lỗi!", "Lỗi khi từ chối địa điểm: " + (err.response?.data?.message || err.message), "error");
            }
        }
    };

    const handleSave = async () => {
        const result = await Swal.fire({
            title: "Bạn có chắc muốn lưu các thay đổi này?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Lưu",
            cancelButtonText: "Hủy"
        });
        if (result.isConfirmed) {
            setLoading(true);
            try {
                const { images, createdByUsername, categoryNames, ...payload } = editedDetails;
                await updateLocation(locationId, payload);
                Swal.fire("Thành công!", "Cập nhật thành công!", "success");
                setIsEditing(false);
                fetchData();
            } catch (err) {
                Swal.fire("Lỗi!", "Lỗi khi cập nhật: " + (err.response?.data?.message || err.message), "error");
            } finally {
                setLoading(false);
            }
        }
    };
    
    // Các hàm xử lý chỉnh sửa khác không đổi
    const handleEditToggle = () => {
        if (!isEditing) {
            const categoryIds = allCategories
                .filter(cat => details.categoryNames?.includes(cat.name))
                .map(cat => cat.categoryId);
            setEditedDetails({ ...details, categoryIds });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (categoryId) => {
        setEditedDetails(prev => {
            const currentCategoryIds = prev.categoryIds || [];
            if (currentCategoryIds.includes(categoryId)) {
                return { ...prev, categoryIds: currentCategoryIds.filter(id => id !== categoryId) };
            } else {
                return { ...prev, categoryIds: [...currentCategoryIds, categoryId] };
            }
        });
    };
    
    if (loading && !details) return <div className="loading-state">Đang tải chi tiết...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;
    if (!details) return <div className="empty-state">Không tìm thấy thông tin.</div>;

    const mediaItems = details.images || [];
    const firstImage = mediaItems.find(mediaUrl => getMediaType(mediaUrl) === 'image');
    const coverImage = firstImage || '/images/default-location-image.png';

    return (
        <div className="location-detail-page">
            <div className="detail-header" style={{ backgroundImage: `url(${coverImage})` }}>
                <div className="detail-header__overlay">
                     {isEditing ? (
                        <input 
                            name="name"
                            value={editedDetails.name}
                            onChange={handleInputChange}
                            className="detail-header__title-input"
                            style={{fontSize: '2.5rem', fontWeight: 800, background: 'rgba(0,0,0,0.5)', border: '1px solid #fff', color: '#fff', borderRadius: '8px', padding: '0.5rem'}}
                        />
                    ) : (
                        <h1 className="detail-header__title">{details.name}</h1>
                    )}
                    {isEditing ? (
                         <input 
                            name="location"
                            value={editedDetails.location}
                            onChange={handleInputChange}
                            className="detail-header__address-input"
                             style={{fontSize: '1.1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid #fff', color: '#fff', borderRadius: '8px', padding: '0.5rem', marginTop: '0.5rem'}}
                        />
                    ): (
                        <p className="detail-header__address"><FaMapMarkerAlt /> {details.location}</p>
                    )}
                    <div className="detail-header__actions">
                        {isEditing ? (
                            <>
                                <button onClick={handleEditToggle} className="action-button-v2 reject"><FaTimesCircle /> Hủy</button>
                                <button onClick={handleSave} className="action-button-v2 approve" disabled={loading}>
                                    {loading ? 'Đang lưu...' : <><FaCheckCircle /> Lưu</>}
                                </button>
                            </>
                        ) : (
                             <>
                                {details.status === 'PENDING' && (
                                    <>
                                    <button onClick={handleReject} className="action-button-v2 reject"><FaTimesCircle /> Từ chối</button>
                                    <button onClick={handleApprove} className="action-button-v2 approve"><FaCheckCircle /> Duyệt</button>
                                    </>
                                )}
                                <button onClick={handleEditToggle} className="action-button-v2" style={{backgroundColor: '#f59e0b', color: 'white'}}>
                                    <FaPencilAlt /> Sửa
                                </button>
                             </>
                        )}
                    </div>
                </div>
            </div>

            <div className="detail-main-content">
                <div className="detail-content-left">
                     <InfoCard title="Mô tả chi tiết" isEditing={isEditing}>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={editedDetails.description}
                                onChange={handleInputChange}
                                rows="10"
                                style={{width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc'}}
                            />
                        ) : (
                            <p className="location-description">{details.description || "Chưa có mô tả."}</p>
                        )}
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
                    <InfoCard title="Thông tin chung" isEditing={isEditing}>
                         {isEditing ? (
                            <div className="form-group">
                                 <label>Danh mục</label>
                                 <div className="multi-select-container">
                                     {allCategories.map(cat => (
                                         <div key={cat.categoryId} className="multi-select-item" onClick={() => handleCategoryChange(cat.categoryId)}>
                                             <input
                                                 type="checkbox"
                                                 checked={editedDetails.categoryIds?.includes(cat.categoryId)}
                                                 readOnly
                                             />
                                             <label>{cat.name}</label>
                                         </div>
                                     ))}
                                 </div>
                                <label>Giờ mở cửa</label><input type="time" name="openTime" value={editedDetails.openTime} onChange={handleInputChange} />
                                <label>Giờ đóng cửa</label><input type="time" name="closeTime" value={editedDetails.closeTime} onChange={handleInputChange} />
                                <label>Giá tham khảo</label><input type="number" name="price" value={editedDetails.price} onChange={handleInputChange} />
                                <label>Số điện thoại</label><input type="tel" name="phoneNumber" value={editedDetails.phoneNumber} onChange={handleInputChange} />
                                <label>Website</label><input type="url" name="website" value={editedDetails.website} onChange={handleInputChange} />
                            </div>
                         ) : (
                            <>
                                <InfoRow icon={<FaTag />} label="Danh mục" value={details.categoryNames?.join(', ')} />
                                <InfoRow icon={<FaClock />} label="Giờ hoạt động" value={details.openTime && details.closeTime ? `${details.openTime} - ${details.closeTime}` : "Chưa cập nhật"} />
                                <InfoRow icon={<FaMoneyBillWave />} label="Giá tham khảo" value={details.price ? `${details.price.toLocaleString('vi-VN')} VNĐ` : "Chưa cập nhật"} />
                                <InfoRow icon={<FaPhone />} label="Số điện thoại" value={details.phoneNumber} />
                                <InfoRow icon={<FaGlobe />} label="Website" value={details.website} isLink={true} />
                            </>
                         )}
                    </InfoCard>
                    <InfoCard title="Thông tin kiểm duyệt">
                        <InfoRow icon={<FaUser />} label="Người tạo" value={details.createdByUsername} />
                        <InfoRow icon={<FaCalendarAlt />} label="Ngày tạo" value={new Date(details.createdAt).toLocaleDateString('vi-VN')} />
                        <InfoRow icon={<FaCheckCircle />} label="Trạng thái"><StatusBadge status={details.status} /></InfoRow>
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