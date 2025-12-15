// src/page-admin/UserManagementPage.jsx
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
        ACTIVE: { text: 'Hoạt động', className: 'status-badge status-active' },
        BANNED: { text: 'Bị khóa', className: 'status-badge status-banned' },
    }[status] || { text: status, className: 'status-badge status-default' };
    return <span className={statusInfo.className}>{statusInfo.text}</span>;
};

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllAccounts();
            // Filter for only USER roles
            const userAccounts = response.data.filter(acc => acc.role === 'USER');
            setUsers(userAccounts);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi khi tải danh sách người dùng.");
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
                    <h2 className="card-title">Quản lý Người dùng</h2>
                    <p className="card-description">Danh sách các tài khoản người dùng (du khách) trên hệ thống.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th className="table-th">Người dùng</th>
                                <th className="table-th">Ngày đăng ký</th>
                                <th className="table-th">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.accountId} className="table-row">
                                        <td className="table-td">
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="table-td">{formatDate(user.createdAt)}</td>
                                        <td className="table-td"><StatusBadge status={user.status} /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="empty-state">Không có người dùng nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}