import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2'; // <-- 1. Thêm import
import { getAllReviews, getPendingReviews, approveReview, rejectReview, deleteReview } from '../services/api';
import { FaCheckCircle, FaTimesCircle, FaStar, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import './ReviewManagement.css'; 

// --- Component Card cho đánh giá CHỜ DUYỆT ---
const PendingReviewCard = ({ review, onApprove, onReject, onImageClick }) => {
    const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi });
    const authorInitial = review.username ? review.username.charAt(0) : 'A';

    return (
        <div className="review-card">
            <div className="review-card__header">
                <div className="review-card__avatar">{authorInitial}</div>
                <div className="review-card__author-info">
                    <div className="review-card__author-name">{review.username}</div>
                    <div className="review-card__location-name">
                        đã đánh giá địa điểm <a href="#">{review.locationName}</a>
                    </div>
                </div>
                <div className="review-card__timestamp">{timeAgo}</div>
            </div>

            <div className="review-card__rating">
                <div className="stars">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`rating-star ${i < review.rating ? 'filled' : ''}`} />
                    ))}
                </div>
                <span>{review.rating}/5 sao</span>
            </div>

            <p className="review-card__comment">{review.comment}</p>
            
            {review.images && review.images.length > 0 && (
                <div className="review-card__images">
                    {review.images.map((img, index) => (
                        <img key={index} src={img} alt={`Ảnh đánh giá ${index + 1}`} className="review-card__image-thumbnail" onClick={() => onImageClick(img)} />
                    ))}
                </div>
            )}

            <div className="review-card__footer">
                <div></div> {/* Empty div for space-between */}
                <div style={{display: 'flex', gap: '0.75rem'}}>
                    <button className="review-action-button reject" onClick={() => onReject(review.reviewId)}>
                        <FaTimesCircle /> Từ chối
                    </button>
                    <button className="review-action-button approve" onClick={() => onApprove(review.reviewId)}>
                        <FaCheckCircle /> Duyệt
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component Card cho các đánh giá KHÁC ---
const ArchivedReviewCard = ({ review, onDelete, onImageClick }) => {
    const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi });
    const authorInitial = review.username ? review.username.charAt(0) : 'A';
    
    return (
        <div className="review-card">
            <div className="review-card__header">
                <div className="review-card__avatar">{authorInitial}</div>
                <div className="review-card__author-info">
                    <div className="review-card__author-name">{review.username}</div>
                    <div className="review-card__location-name">
                        đã đánh giá địa điểm <a href="#">{review.locationName}</a>
                    </div>
                </div>
                <div className="review-card__timestamp">{timeAgo}</div>
            </div>
             <div className="review-card__rating">
                <div className="stars">
                    {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`rating-star ${i < review.rating ? 'filled' : ''}`} />
                    ))}
                </div>
                <span>{review.rating}/5 sao</span>
            </div>
            <p className="review-card__comment">{review.comment}</p>
             {review.images && review.images.length > 0 && (
                <div className="review-card__images">
                    {review.images.map((img, index) => (
                        <img key={index} src={img} alt={`Ảnh đánh giá ${index + 1}`} className="review-card__image-thumbnail" onClick={() => onImageClick(img)} />
                    ))}
                </div>
            )}
            <div className="review-card__footer">
                <StatusBadge status={review.status} />
                <button className="review-action-button delete" onClick={() => onDelete(review.reviewId)}>
                    <FaTrash /> Xóa
                </button>
            </div>
        </div>
    );
};

// --- Helper Components ---
const StatusBadge = ({ status }) => { 
    const statusStyles = { 
        PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' }, 
        ACTIVE: { text: 'Đã duyệt', className: 'status-badge status-active' }, 
        INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' }, 
    }; 
    const statusInfo = statusStyles[status] || { text: status, className: 'status-badge status-default' }; 
    return <span className={statusInfo.className}>{statusInfo.text}</span>; 
};

const Pagination = ({ reviewsPerPage, totalReviews, paginate, currentPage }) => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalReviews / reviewsPerPage); i++) {
        pageNumbers.push(i);
    }
    if (pageNumbers.length <= 1) return null;

    return (
        <nav>
            <ul className="pagination">
                {pageNumbers.map(number => (
                    <li key={number} className={`pagination__item ${currentPage === number ? 'active' : ''}`}>
                        <a onClick={() => paginate(number)} href="#!" className="pagination__link">
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

// --- Component Chính ---
export default function ReviewManagementPage() {
    const [allReviews, setAllReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('pending');
    const REVIEWS_PER_PAGE = 7;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [allReviewsRes, pendingReviewsRes] = await Promise.all([
                getAllReviews(),
                getPendingReviews(),
            ]);
            const sortedAll = allReviewsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const sortedPending = pendingReviewsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAllReviews(sortedAll);
            setPendingReviews(sortedPending);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi không xác định.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // <-- 2. Thay thế toàn bộ các hàm xử lý bằng SweetAlert2 -->
    const handleApprove = async (reviewId) => {
        const result = await Swal.fire({
            title: "Duyệt đánh giá này?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Duyệt",
            cancelButtonText: "Hủy"
        });
        if (result.isConfirmed) {
            try {
                await approveReview(reviewId);
                Swal.fire('Thành công!', 'Đánh giá đã được duyệt.', 'success');
                fetchData();
            } catch (err) {
                Swal.fire('Lỗi!', 'Lỗi: ' + err.message, 'error');
            }
        }
    };

    const handleReject = async (reviewId) => {
        const result = await Swal.fire({
            title: "Từ chối đánh giá này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Từ chối",
            cancelButtonText: "Hủy",
            confirmButtonColor: '#d33'
        });
        if (result.isConfirmed) {
            try {
                await rejectReview(reviewId);
                Swal.fire('Thành công!', 'Đánh giá đã bị từ chối.', 'success');
                fetchData();
            } catch (err) {
                Swal.fire('Lỗi!', 'Lỗi: ' + err.message, 'error');
            }
        }
    };

    const handleDelete = async (reviewId) => {
        const result = await Swal.fire({
            title: "Xóa vĩnh viễn đánh giá?",
            text: "Hành động này không thể hoàn tác!",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Xóa ngay",
            cancelButtonText: "Hủy",
            confirmButtonColor: '#d33'
        });
        if (result.isConfirmed) {
            try {
                await deleteReview(reviewId);
                Swal.fire('Đã xóa!', 'Đánh giá đã được xóa vĩnh viễn.', 'success');
                fetchData();
            } catch (err) {
                Swal.fire('Lỗi!', 'Lỗi: ' + err.message, 'error');
            }
        }
    };
    
    // Logic phân trang (không đổi)
    const indexOfLastReview = currentPage * REVIEWS_PER_PAGE;
    const indexOfFirstReview = indexOfLastReview - REVIEWS_PER_PAGE;
    const currentReviews = allReviews.slice(indexOfFirstReview, indexOfLastReview);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <div className="content-wrapper">
            <div className="card" style={{padding: '1.5rem 1.5rem 0 1.5rem'}}>
                <div className="tabs-container">
                    <button 
                        className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Chờ duyệt
                        <span className="count-badge">{pendingReviews.length}</span>
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả đánh giá
                        <span className="count-badge">{allReviews.length}</span>
                    </button>
                </div>
                
                <div className="review-list-container" style={{padding: '1.5rem 0'}}>
                    {activeTab === 'pending' && (
                        <>
                            {pendingReviews.length > 0 ? (
                                pendingReviews.map((review) => (
                                    <PendingReviewCard key={review.reviewId} review={review} onApprove={handleApprove} onReject={handleReject} onImageClick={setSelectedImage} />
                                ))
                            ) : (
                                <div className="empty-state">Không có đánh giá nào đang chờ duyệt.</div>
                            )}
                        </>
                    )}

                    {activeTab === 'all' && (
                        <>
                            {currentReviews.length > 0 ? (
                                currentReviews.map((review) => (
                                    <ArchivedReviewCard key={review.reviewId} review={review} onDelete={handleDelete} onImageClick={setSelectedImage}/>
                                ))
                            ) : (
                                <div className="empty-state">Không có đánh giá nào trong hệ thống.</div>
                            )}
                            <Pagination reviewsPerPage={REVIEWS_PER_PAGE} totalReviews={allReviews.length} paginate={paginate} currentPage={currentPage}/>
                        </>
                    )}
                </div>
            </div>

            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Xem ảnh lớn" className="image-modal-content" />
                    <button className="image-modal-close" onClick={() => setSelectedImage(null)}>×</button>
                </div>
            )}
        </div>
    );
}