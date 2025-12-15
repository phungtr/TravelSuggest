// src/page-company/CompanyAdManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // <-- 1. Thêm import
import { getCompanyAds, deleteAd } from '../services/api';
import '../page-staff/account-management.css';

const StatusBadge = ({ status }) => {
    const statusInfo = {
        PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' },
        ACTIVE: { text: 'Đang hoạt động', className: 'status-badge status-active' },
        INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' },
    }[status] || { text: status, className: 'status-badge status-default' };
    return <span className={statusInfo.className}>{statusInfo.text}</span>;
};

const CompanyAdManagement = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const adsRes = await getCompanyAds();
            setAds(adsRes.data);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi không xác định.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // <-- 2. Thay thế window.confirm và alert -->
    const handleDeleteAd = async (adId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa quảng cáo này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy bỏ'
        });

        if (result.isConfirmed) {
            try {
                await deleteAd(adId);
                Swal.fire(
                    'Đã xóa!',
                    'Chiến dịch quảng cáo của bạn đã được xóa.',
                    'success'
                );
                fetchData();
            } catch (err) {
                Swal.fire(
                    'Lỗi!',
                    `Lỗi khi xóa quảng cáo: ${err.message}`,
                    'error'
                );
            }
        }
    };

    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <div className="content-wrapper">
            <div className="card">
                 <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="card-title">Chiến dịch quảng cáo</h2>
                        <p className="card-description">Tạo và theo dõi các chiến dịch quảng cáo của bạn.</p>
                    </div>
                    <button onClick={() => navigate('/company/add-ad')} className="action-button approve-button">Tạo chiến dịch mới</button>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-th">Tiêu đề</th>
                                <th className="table-th">Địa điểm</th>
                                <th className="table-th">Trạng thái</th>
                                <th className="table-th">Ngày kết thúc</th>
                                <th className="table-th text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                           {ads.length > 0 ? ads.map(ad => (
                                <tr key={ad.adId} className="table-row">
                                    <td className="table-td font-medium">{ad.title}</td>
                                    <td className="table-td">{ad.locationName}</td>
                                    <td className="table-td"><StatusBadge status={ad.status} /></td>
                                    <td className="table-td">{new Date(ad.endDate).toLocaleDateString('vi-VN')}</td>
                                     <td className="table-td text-center">
                                        <button onClick={() => handleDeleteAd(ad.adId)} className="action-button reject-button">Xóa</button>
                                    </td>
                                </tr>
                            )) : (
                                 <tr>
                                    <td colSpan="5" className="empty-state">Bạn chưa có chiến dịch nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompanyAdManagement;