// src/page-company/CompanyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { FaEye, FaHeart, FaStar, FaDownload, FaRoute, FaPaperPlane } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    getCompanyLocations,
    getAdPerformance,
    getCompanyAds,
    getMonthlyReviews,
    getMonthlyLocationSummary,
    getAverageRating,
    getActiveReviewsAndAverageRating,
    replyToReview
} from '../services/api';
import '../page-staff/Dashboard.css';
import './CompanyDashboard.css';
import CompanyChatbot from '../components/CompanyChatbot'; // ⚠️ THÊM LẠI IMPORT

// --- (Các component con và hàm helper không thay đổi) ---
const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const formatNumber = (value) => (value || 0).toLocaleString('vi-VN');

const StatCard = ({ title, value, change, icon, subtitle, iconColor }) => {
    const isUp = change >= 0;
    const changeColor = isUp ? '#10b981' : '#ef4444';

    return (
        <div className="stat-card">
            <div className="stat-card-info">
                <p className="stat-card-title">{title}</p>
                <p className="stat-card-value">{value}</p>
                {subtitle ? (
                    <p className="stat-card-subtitle">{subtitle}</p>
                ) : (
                    change !== null && !isNaN(change) && (
                        <p className="stat-card-change" style={{ color: changeColor }}>
                            <span className="change-arrow">{isUp ? '▲' : '▼'}</span> {Math.abs(change).toFixed(1)}% so với tháng trước
                        </p>
                    )
                )}
            </div>
            <div className="stat-card-icon" style={{ color: iconColor }}>{icon}</div>
        </div>
    );
};

const DashboardHeader = ({ stats }) => (
    <div className="stats-header">
        <div className="stats-header-welcome">
            <h2>Chào mừng trở lại!</h2>
            <p>Đây là tổng quan hiệu suất kinh doanh của bạn.</p>
        </div>
        <div className="stats-header-actions">
            <button className="export-button">
                <FaDownload /> Xuất báo cáo
            </button>
        </div>
        <div className="stats-header-cards">
            <StatCard
                title="Tổng lượt tiếp cận"
                value={formatNumber(stats.totalViews.current)}
                change={stats.totalViews.change}
                icon={<FaEye />}
                iconColor="#3b82f6"
            />
            <StatCard
                title="Tương tác mới"
                value={formatNumber(stats.interactions.current)}
                change={stats.interactions.change}
                icon={<FaHeart />}
                iconColor="#ef4444"
            />
            <StatCard
                title="Đánh giá trung bình"
                value={`${(stats.avgRating.average || 0).toFixed(1)} / 5`}
                subtitle={`Dựa trên ${formatNumber(stats.avgRating.count)} đánh giá`}
                icon={<FaStar />}
                iconColor="#f59e0b"
            />
        </div>
    </div>
);

const GrowthChart = ({ data }) => (
    <div className="widget-card">
        <h3 className="widget-title">Biểu đồ tăng trưởng</h3>
        <div className="chart-container">
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthYear" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalViews" name="Lượt xem" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="totalFavorites" name="Lượt yêu thích" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Không đủ dữ liệu để hiển thị biểu đồ.
                </div>
            )}
        </div>
    </div>
);

const ReviewItem = ({ review, isReply = false, replyingTo, replyContent, setReplyContent, handleReplyClick, handleCancelReply, handleReplySubmit, isSubmitting }) => (
    <div className={`review-item-with-avatar ${isReply ? 'is-reply' : ''}`}>
        <div className="review-avatar">
            {review.avatar ? (
                <img src={review.avatar} alt={review.username} />
            ) : (
                <span>{review.username ? review.username.charAt(0) : '?'}</span>
            )}
        </div>
        <div className="review-content">
            <div className="review-header">
                <strong>{review.username}</strong>
                {!isReply && (
                    <span className="review-rating">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} color={i < review.rating ? '#f59e0b' : '#e5e7eb'} />
                        ))}
                    </span>
                )}
            </div>
            <p className="review-comment">{review.comment}</p>
            {!isReply && review.images && review.images.length > 0 && (
                <div className="review-images">
                    {review.images.map((img, index) => (
                        <img key={index} src={img} alt={`Ảnh đánh giá ${index + 1}`} className="review-image-thumbnail" />
                    ))}
                </div>
            )}
            <small className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>

            {!isReply && (
                replyingTo === review.reviewId ? (
                    <div className="reply-form">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Viết phản hồi của bạn..."
                            rows="3"
                            autoFocus
                        />
                        <div className="reply-form__actions">
                            <button className="btn-cancel" onClick={handleCancelReply}>Hủy</button>
                            <button className="btn-send" onClick={() => handleReplySubmit(review.reviewId)} disabled={isSubmitting}>
                                {isSubmitting ? 'Đang gửi...' : <><FaPaperPlane /> Gửi</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    review.replies.length === 0 && <button className="review-reply-button" onClick={() => handleReplyClick(review.reviewId)}>Phản hồi</button>
                )
            )}
        </div>
    </div>
);

const LatestReviews = ({ reviews, onReviewReplied }) => {
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const structuredReviews = React.useMemo(() => {
        const reviewMap = new Map();
        const parentReviews = [];
        reviews.forEach(review => {
            reviewMap.set(review.reviewId, { ...review, replies: [] });
            if (!review.parentReviewId) {
                parentReviews.push(review.reviewId);
            }
        });
        reviews.forEach(review => {
            if (review.parentReviewId) {
                const parent = reviewMap.get(review.parentReviewId);
                if (parent) {
                    parent.replies.push(reviewMap.get(review.reviewId));
                }
            }
        });
        return parentReviews.map(id => reviewMap.get(id));
    }, [reviews]);

    const handleReplyClick = (reviewId) => {
        setReplyingTo(reviewId);
        setReplyContent("");
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyContent("");
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyContent.trim()) {
            Swal.fire('Chưa nhập nội dung', 'Vui lòng nhập nội dung phản hồi.', 'warning');
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.userId) {
            Swal.fire('Lỗi xác thực', 'Không thể xác thực người dùng. Vui lòng đăng nhập lại.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await replyToReview(reviewId, replyContent, user.userId);
            await Swal.fire({
                title: 'Thành công!',
                text: 'Gửi phản hồi thành công!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            handleCancelReply();
            onReviewReplied();
        } catch (error) {
            Swal.fire({
                title: 'Lỗi!',
                text: "Lỗi khi gửi phản hồi: " + (error.response?.data?.message || error.message),
                icon: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="widget-card">
            <h3 className="widget-title">Đánh giá gần đây</h3>
            <div className="scrollable-content">
                {structuredReviews.length > 0 ? (
                    <ul className="review-list">
                        {structuredReviews.map(review => (
                            <li key={review.reviewId} className="review-thread">
                                <ReviewItem
                                    review={review}
                                    replyingTo={replyingTo}
                                    replyContent={replyContent}
                                    setReplyContent={setReplyContent}
                                    handleReplyClick={handleReplyClick}
                                    handleCancelReply={handleCancelReply}
                                    handleReplySubmit={handleReplySubmit}
                                    isSubmitting={isSubmitting}
                                />
                                {review.replies && review.replies.length > 0 && (
                                    <div className="review-replies-container">
                                        {review.replies.map(reply => (
                                            <ReviewItem key={reply.reviewId} review={reply} isReply={true} />
                                        ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-state">Chưa có đánh giá nào.</div>
                )}
            </div>
        </div>
    );
};

const ConversionFunnel = ({ data }) => {
    const { totalViews = 0, totalFavorites = 0, totalDirections = 0 } = data;
    const maxVal = Math.max(totalViews, 1);
    const funnelData = [
        { label: 'Lượt xem', value: totalViews, icon: <FaEye />, color: '#4299e1' },
        { label: 'Lượt yêu thích', value: totalFavorites, icon: <FaHeart />, color: '#ef4444' },
        { label: 'Yêu cầu chỉ đường', value: totalDirections, icon: <FaRoute />, color: '#f6ad55' }
    ];
    return (
        <div className="widget-card">
            <h3 className="widget-title">Phễu tương tác</h3>
            <div className="funnel-container-v2 scrollable-content">
                {funnelData.map((stage) => (
                    <React.Fragment key={stage.label}>
                        <div className="funnel-stage-v2">
                            <div className="funnel-icon" style={{ backgroundColor: stage.color }}>{stage.icon}</div>
                            <div className="funnel-details">
                                <span className="funnel-label">{stage.label}</span>
                                <span className="funnel-value">{formatNumber(stage.value)}</span>
                            </div>
                        </div>
                        <div className="funnel-bar-wrapper">
                            <div className="funnel-bar" style={{ width: `${(stage.value / maxVal) * 100}%`, backgroundColor: stage.color }} />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const AdRoiReport = ({ ads, performance }) => {
    const reportData = ads.map(ad => {
        let adImpressions = 0, adClicks = 0;
        if (performance.impressions && typeof performance.impressions === 'object') {
            adImpressions = performance.impressions[ad.adId] || 0;
        } else if (ads.length === 1 && typeof performance.totalImpressions === 'number') {
            adImpressions = performance.totalImpressions;
        }
        if (performance.clicks && typeof performance.clicks === 'object') {
            adClicks = performance.clicks[ad.adId] || 0;
        } else if (ads.length === 1 && typeof performance.totalClicks === 'number') {
            adClicks = performance.totalClicks;
        }
        const ctr = adImpressions > 0 ? (adClicks / adImpressions) * 100 : 0;
        const cpa = adClicks > 0 ? (ad.budget || 0) / adClicks : 0;
        return { ...ad, adImpressions, adClicks, ctr, cpa };
    });
    return (
        <div className="widget-card">
            <h3 className="widget-title">Hiệu suất & ROI Quảng cáo</h3>
            <div className="table-responsive scrollable-content">
                <table className="data-table roi-table">
                    <thead>
                        <tr>
                            <th>Chiến dịch</th>
                            <th>Ngân sách</th>
                            <th>Hiển thị</th>
                            <th>Nhấp chuột</th>
                            <th>CTR</th>
                            <th>CPA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.length > 0 ? reportData.map(ad => (
                            <tr key={ad.adId}>
                                <td>{ad.title}</td>
                                <td>{formatCurrency(ad.budget)}</td>
                                <td>{formatNumber(ad.adImpressions)}</td>
                                <td>{formatNumber(ad.adClicks)}</td>
                                <td>{ad.ctr.toFixed(2)}%</td>
                                <td>{formatCurrency(ad.cpa)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
                                    Không có dữ liệu quảng cáo.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const CompanyDashboard = () => {
    const [locations, setLocations] = useState([]);
    const [companyAds, setCompanyAds] = useState([]);
    const [adPerformance, setAdPerformance] = useState({});
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationData, setLocationData] = useState({ summary: {}, reviews: [], monthlySummary: [], avgRating: { average: 0, count: 0 } });
    const [loading, setLoading] = useState(true);
    const [locationDetailLoading, setLocationDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // ⚠️ THÊM LẠI STATE ĐỂ LẤY COMPANY ID
    const [companyId, setCompanyId] = useState(null);
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.userId) {
            setCompanyId(user.userId);
        }
    }, []);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [locRes, adsRes, perfRes] = await Promise.all([
                getCompanyLocations(), getCompanyAds(), getAdPerformance(),
            ]);
            const allAds = adsRes.data || [];
            const advertisedLocationIds = new Set(allAds.map(ad => ad.locationId));
            const allLocations = (locRes.data || []).map(loc => ({
                ...loc, isAdvertised: advertisedLocationIds.has(loc.locationId)
            }));
            setLocations(allLocations);
            setCompanyAds(allAds);
            setAdPerformance(perfRes.data || {});
            if (allLocations.length > 0) {
                const firstLocation = allLocations.find(l => l.isAdvertised) || allLocations[0];
                setSelectedLocation(firstLocation);
            }
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu ban đầu.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDetailsForLocation = useCallback(async (locationId) => {
        if (!locationId) return;
        setLocationDetailLoading(true);
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;

            const [reviewsRes, monthlyRes, ratingRes, activeReviewsRes] = await Promise.all([
                getMonthlyReviews(locationId, year, month),
                getMonthlyLocationSummary(locationId),
                getAverageRating(locationId),
                getActiveReviewsAndAverageRating(locationId)
            ]);

            const monthlyData = Array.isArray(monthlyRes.data.result) ? monthlyRes.data.result : [];
            const totalSummary = monthlyData.reduce(
                (acc, month) => {
                    if (month) {
                        acc.totalViews += month.totalViews || 0;
                        acc.totalFavorites += month.totalFavorites || 0;
                        acc.totalDirections += month.totalDirections || 0;
                    }
                    return acc;
                },
                { totalViews: 0, totalFavorites: 0, totalDirections: 0 }
            );

            setLocationData({
                summary: totalSummary,
                reviews: (reviewsRes.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                monthlySummary: monthlyData,
                avgRating: {
                    average: ratingRes.data || 0,
                    count: activeReviewsRes.data.result.length || 0,
                },
            });
        } catch (err) {
            console.error("Lỗi xử lý dữ liệu dashboard:", err);
            setError("Lỗi khi tải chi tiết cho địa điểm.");
            setLocationData({ summary: {}, reviews: [], monthlySummary: [], avgRating: { average: 0, count: 0 } });
        } finally {
            setLocationDetailLoading(false);
        }
    }, []);

    useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

    useEffect(() => {
        if (selectedLocation) {
            fetchDetailsForLocation(selectedLocation.locationId);
        }
    }, [selectedLocation, fetchDetailsForLocation]);

    const handleLocationChange = (e) => {
        const newLocationId = e.target.value;
        const newSelectedLocation = locations.find(loc => loc.locationId.toString() === newLocationId);
        if (newSelectedLocation) {
            setSelectedLocation(newSelectedLocation);
        }
    };

    const handleReviewReplied = () => {
        if (selectedLocation) {
            fetchDetailsForLocation(selectedLocation.locationId);
        }
    };

    const sortedMonthly = [...locationData.monthlySummary].sort((a, b) => (a.year - b.year) || (a.month - b.month));
    const currentMonthStats = sortedMonthly[sortedMonthly.length - 1] || {};
    const prevMonthStats = sortedMonthly[sortedMonthly.length - 2] || {};

    const calculateChange = (current, previous) => {
        if (previous === null || previous === undefined || previous === 0) return null;
        return ((current - previous) / previous) * 100;
    };

    const currentInteractions = (currentMonthStats.totalFavorites || 0) + (currentMonthStats.totalDirections || 0);
    const prevInteractions = (prevMonthStats.totalFavorites || 0) + (prevMonthStats.totalDirections || 0);

    const headerStats = {
        totalViews: {
            current: currentMonthStats.totalViews || 0,
            change: calculateChange(currentMonthStats.totalViews, prevMonthStats.totalViews),
        },
        interactions: {
            current: currentInteractions,
            change: calculateChange(currentInteractions, prevInteractions),
        },
        avgRating: locationData.avgRating,
    };

    const chartData = sortedMonthly.map(item => ({ ...item, monthYear: `${item.month}/${item.year}` })).slice(-3);
    const adsForSelectedLocation = selectedLocation ? companyAds.filter(ad => ad.locationId === selectedLocation.locationId) : [];

    if (loading) return <div className="loading-state">Đang tải dữ liệu trang tổng quan...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <div className="company-dashboard-container">
            <div className="dashboard-location-selector">
                <h1>Tổng quan hiệu suất</h1>
                {locations.length > 0 && (
                    <div className="location-selector">
                        <label htmlFor="location-select">Xem dữ liệu cho địa điểm:</label>
                        <select id="location-select" value={selectedLocation?.locationId || ''} onChange={handleLocationChange}>
                            {locations.map(loc => (
                                <option key={loc.locationId} value={loc.locationId}>
                                    {loc.isAdvertised ? '⭐ ' : ''}{loc.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {locations.length === 0 ? (
                <div className="widget-card empty-state">
                    <p>Bạn chưa có địa điểm nào. Hãy bắt đầu bằng cách thêm địa điểm đầu tiên!</p>
                </div>
            ) : locationDetailLoading ? (
                <div className="loading-state">Đang tải dữ liệu cho địa điểm...</div>
            ) : (
                <>
                    <DashboardHeader stats={headerStats} />
                    {selectedLocation?.isAdvertised ? (
                        <div className="dashboard-grid-new">
                            <ConversionFunnel data={locationData.summary} />
                            <AdRoiReport ads={adsForSelectedLocation} performance={adPerformance} />
                            <GrowthChart data={chartData} />
                            <LatestReviews reviews={locationData.reviews} onReviewReplied={handleReviewReplied} />
                        </div>
                    ) : (
                        <div className="dashboard-grid-simple">
                            <LatestReviews reviews={locationData.reviews} onReviewReplied={handleReviewReplied} />
                            <div className="simple-stats-container">
                                <div className="widget-card">
                                    <h3 className="widget-title">Tổng Lượt Yêu Thích</h3>
                                    <div className="simple-stat-value">
                                        <FaHeart style={{ color: '#ef4444' }} /> {formatNumber(locationData.summary.totalFavorites)}
                                    </div>
                                </div>
                                <div className="widget-card">
                                    <h3 className="widget-title">Tổng Lượt Xem</h3>
                                    <div className="simple-stat-value" style={{ color: '#3b82f6' }}>
                                        <FaEye /> {formatNumber(locationData.summary.totalViews)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            
            {/* ⚠️ THÊM LẠI CHATBOT VỚI ĐIỀU KIỆN MỚI */}
            {companyId && selectedLocation?.isAdvertised && <CompanyChatbot companyId={companyId} />}
        </div>
    );
};

export default CompanyDashboard;