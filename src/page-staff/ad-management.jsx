import React, { useState, useEffect, useCallback } from 'react';

// --- Imports ---
// XÓA: import Sidebar không còn cần thiết.
import {
    getAllAds,
    getPendingAds,
    approveAd,
    rejectAd,
    deleteAd,
    // XÓA: Các API này đã được gọi ở layout cha, không cần ở đây.
} from '../services/api';
import './account-management.css'; // Giữ lại CSS nếu có style chung cho các bảng, nút...

// --- Icon Components (Không thay đổi) ---
const CheckCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const XCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

// --- Helper Functions (Không thay đổi) ---
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
const formatCurrency = (number) => { if (number === null || number === undefined) return 'N/A'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number); };
const StatusBadge = ({ status }) => { const statusStyles = { PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' }, ACTIVE: { text: 'Đang chạy', className: 'status-badge status-active' }, INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' }, }; const statusInfo = statusStyles[status] || { text: status, className: 'status-badge status-default' }; return <span className={statusInfo.className}>{statusInfo.text}</span>; };

// --- Main Component ---
export default function AdManagementPage() {
    // State
    const [allAds, setAllAds] = useState([]);
    const [pendingAds, setPendingAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // XÓA: State 'counts' đã được quản lý bởi StaffLayout.

    // Data Fetching
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // TINH GỌN: Chỉ gọi API cần thiết cho trang này.
            const [allAdsRes, pendingAdsRes] = await Promise.all([
                getAllAds(),
                getPendingAds(),
            ]);
            
            setAllAds(allAdsRes.data);
            setPendingAds(pendingAdsRes.data);

        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi không xác định.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Handlers (Không thay đổi)
    const handleApprove = async (adId) => { if (!window.confirm("Bạn có chắc muốn duyệt quảng cáo này?")) return; try { await approveAd(adId); fetchData(); } catch (err) { alert("Lỗi khi duyệt quảng cáo: " + err.message); } };
    const handleReject = async (adId) => { if (!window.confirm("Bạn có chắc muốn từ chối quảng cáo này?")) return; try { await rejectAd(adId); fetchData(); } catch (err) { alert("Lỗi khi từ chối quảng cáo: " + err.message); } };
    const handleDelete = async (adId) => { if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn quảng cáo này?")) return; try { await deleteAd(adId); fetchData(); } catch (err) { alert("Lỗi khi xóa quảng cáo: " + err.message); } };

    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    // THAY ĐỔI LỚN: Loại bỏ toàn bộ cấu trúc layout thừa.
    // Component giờ chỉ trả về nội dung chính của trang.
    return (
        <div className="content-wrapper">
            {/* Card 1: Quảng cáo chờ duyệt */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Quảng cáo chờ duyệt ({pendingAds.length})</h2>
                    <p className="card-description">Danh sách các chiến dịch quảng cáo cần được phê duyệt.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-th">Địa điểm quảng cáo</th>
                                <th scope="col" className="table-th">Người tạo</th>
                                <th scope="col" className="table-th">Ngân sách</th>
                                <th scope="col" className="table-th text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {pendingAds.length > 0 ? (
                                pendingAds.map((ad) => (
                                    <tr key={ad.adId} className="table-row">
                                        <td className="table-td">{ad.locationName}</td>
                                        <td className="table-td">{ad.createdByUsername}</td>
                                        <td className="table-td">{formatCurrency(ad.budget)}</td>
                                        <td className="table-td text-center">
                                            <div className="action-buttons-group">
                                                <button onClick={() => handleApprove(ad.adId)} className="action-button approve-button"><CheckCircleIcon className="button-icon" /> Duyệt</button>
                                                <button onClick={() => handleReject(ad.adId)} className="action-button reject-button"><XCircleIcon className="button-icon" /> Từ chối</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-state">Không có quảng cáo nào đang chờ duyệt.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Card 2: Tất cả quảng cáo */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Tất cả quảng cáo</h2>
                    <p className="card-description">Danh sách toàn bộ chiến dịch quảng cáo trên hệ thống.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                         <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-th">Địa điểm</th>
                                <th scope="col" className="table-th">Thời gian</th>
                                <th scope="col" className="table-th">Ngân sách</th>
                                <th scope="col" className="table-th">Trạng thái</th>
                                <th scope="col" className="table-th text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {allAds.length > 0 ? (
                                allAds.map((ad) => (
                                    <tr key={ad.adId} className="table-row">
                                        <td className="table-td">{ad.locationName}</td>
                                        <td className="table-td">{formatDate(ad.startDate)} - {formatDate(ad.endDate)}</td>
                                        <td className="table-td">{formatCurrency(ad.budget)}</td>
                                        <td className="table-td"><StatusBadge status={ad.status} /></td>
                                        <td className="table-td text-center">
                                            <button onClick={() => handleDelete(ad.adId)} className="action-button reject-button">
                                                <TrashIcon className="button-icon" /> Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="empty-state">Không có quảng cáo nào trong hệ thống.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}