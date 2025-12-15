// src/page-admin/CompanyManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllAccounts } from '../services/api';
import '../page-staff/account-management.css'; // Reusing styles

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const StatusBadge = ({ status }) => {
    const statusInfo = {
        PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' },
        ACTIVE: { text: 'Hoạt động', className: 'status-badge status-active' },
        INACTIVE: { text: 'Từ chối', className: 'status-badge status-inactive' },
        BANNED: { text: 'Bị khóa', className: 'status-badge status-banned' },
    }[status] || { text: status, className: 'status-badge status-default' };
    return <span className={statusInfo.className}>{statusInfo.text}</span>;
};

export default function CompanyManagementPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllAccounts();
            // Filter for only COMPANY roles
            const companyAccounts = response.data.filter(acc => acc.role === 'COMPANY');
            setCompanies(companyAccounts);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi tải danh sách đối tác.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="loading-state">Đang tải...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <div className="content-wrapper">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Quản lý Đối tác</h2>
                    <p className="card-description">Danh sách các tài khoản đối tác (công ty) trên hệ thống.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Tên công ty</th>
                                <th className="table-th">Ngày đăng ký</th>
                                <th className="table-th">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {companies.length > 0 ? (
                                companies.map(company => (
                                    <tr key={company.accountId} className="table-row">
                                        <td className="table-td">
                                            <div className="font-medium">{company.username}</div>
                                            <div className="text-gray-500">{company.email}</div>
                                        </td>
                                        <td className="table-td">{formatDate(company.createdAt)}</td>
                                        <td className="table-td"><StatusBadge status={company.status} /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="empty-state">Không có đối tác nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}