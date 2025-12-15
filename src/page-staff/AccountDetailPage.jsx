// src/page-staff/AccountDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // <-- 1. Thêm import
import { getPendingAccountDetail, approveCompanyAccount, rejectCompanyAccount } from '../services/api';
import { FaExternalLinkAlt, FaCheckCircle } from 'react-icons/fa';

// Import file CSS chung
import './account-management.css';

// --- Helper Functions ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { dateStyle: 'long', timeStyle: 'short' });
};

const DetailRow = ({ label, value, placeholder = "Chưa cung cấp" }) => (
    <div className="detail-row">
        <span className="detail-label">{label}</span>
        {value ? (
            <span className="detail-value">{value}</span>
        ) : (
            <span className="detail-value detail-value-placeholder">{placeholder}</span>
        )}
    </div>
);


// --- Main Component ---
export default function AccountDetailPage() {
    const { accountId } = useParams();
    const navigate = useNavigate();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPendingAccountDetail(accountId);
            setDetails(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể tải chi tiết tài khoản.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // <-- 2. Thay thế window.confirm và alert -->
    const handleApprove = async () => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn duyệt tài khoản này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await approveCompanyAccount(accountId);
                await Swal.fire('Thành công!', 'Duyệt tài khoản thành công!', 'success');
                navigate('/staff/accounts');
            } catch (err) {
                Swal.fire('Lỗi!', "Lỗi khi duyệt tài khoản: " + (err.response?.data?.message || err.message), 'error');
            }
        }
    };

    // <-- 3. Thay thế window.confirm và alert -->
    const handleReject = async () => {
        const result = await Swal.fire({
            title: 'Bạn có chắc muốn từ chối tài khoản này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#d33'
        });
        
        if (result.isConfirmed) {
            try {
                await rejectCompanyAccount(accountId);
                await Swal.fire('Thành công!', 'Từ chối tài khoản thành công!', 'success');
                navigate('/staff/accounts');
            } catch (err) {
                Swal.fire('Lỗi!', "Lỗi khi từ chối tài khoản: " + (err.response?.data?.message || err.message), 'error');
            }
        }
    };

    if (loading) return <div className="loading-state">Đang tải chi tiết...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;
    if (!details) return <div className="empty-state">Không tìm thấy thông tin.</div>;

    const defaultAvatar = "/images/image.png";

    return (
        <div className="page-container">
            <div className="account-detail-card">
                <header className="account-detail-header">
                    <img
                        src={details.avatarUrl || defaultAvatar}
                        alt="Avatar"
                        className="account-detail-avatar"
                    />
                    <div className="account-detail-info">
                        <h1 className="account-detail-name">
                            {details.companyName || details.username}
                            <FaCheckCircle className="verified-icon" />
                        </h1>
                        <p className="account-detail-email">{details.email}</p>
                    </div>
                </header>

                <main className="account-detail-body">
                    <div className="info-column">
                        <h3 className="column-title">Chi tiết tài khoản</h3>
                        <DetailRow label="Tên tài khoản" value={details.username} />
                        <DetailRow label="Email" value={details.email} />
                        <DetailRow label="Ngày đăng ký" value={formatDate(details.createdAt)} />
                        <DetailRow label="Trạng thái" value={
                            <span className="status-badge status-pending">Chờ duyệt</span>
                        } />
                    </div>

                    <div className="info-column">
                        <h3 className="column-title">Thông tin công ty</h3>
                        <DetailRow label="Tên công ty" value={details.companyName} />
                        <DetailRow label="Số điện thoại" value={details.phoneNumber} />
                        <DetailRow label="Mã số thuế" value={details.taxCode} />
                        <DetailRow label="Địa chỉ" value={details.address} />
                        <DetailRow label="Giấy phép kinh doanh" value={
                            details.businessLicenseUrl ? (
                                <a href={details.businessLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-link">
                                    <FaExternalLinkAlt size={12} />
                                    <span>Xem giấy phép</span>
                                </a>
                            ) : null
                        } placeholder="Chưa cung cấp"/>
                    </div>
                </main>

                 <footer className="card-footer">
                    <button onClick={handleReject} className="action-button reject-button">Từ chối</button>
                    <button onClick={handleApprove} className="action-button approve-button">Duyệt tài khoản</button>
                </footer>
            </div>
        </div>
    );
}