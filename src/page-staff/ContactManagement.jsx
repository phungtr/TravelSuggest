// src/page-staff/ContactManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getAllContactInfo } from '../services/api';
import './account-management.css'; // Tái sử dụng CSS từ trang quản lý tài khoản

// **BẮT ĐẦU THAY ĐỔI**
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    // Định dạng giờ:phút (ví dụ: 23:31)
    const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Định dạng ngày tháng năm (ví dụ: 23 tháng 8, 2025)
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return `${timeFormatter.format(date)} ${dateFormatter.format(date)}`;
};
// **KẾT THÚC THAY ĐỔI**

export default function ContactManagementPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllContactInfo();
            // Sắp xếp để liên hệ mới nhất lên đầu
            const sortedContacts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setContacts(sortedContacts);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi không xác định.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="loading-state">Đang tải dữ liệu...</div>;
    }
    if (error) {
        return <div className="error-state">Lỗi: {error}</div>;
    }

    return (
        <div className="content-wrapper">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Hòm thư liên hệ</h2>
                    <p className="card-description">Danh sách các yêu cầu tư vấn từ khách hàng tiềm năng.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-th">Khách hàng</th>
                                <th scope="col" className="table-th">Thông tin liên hệ</th>
                                <th scope="col" className="table-th">Lời nhắn</th>
                                <th scope="col" className="table-th">Ngày gửi</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {contacts.length > 0 ? (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className="table-row">
                                        <td className="table-td">
                                            <div className="font-medium text-gray-900">{contact.fullName}</div>
                                        </td>
                                        <td className="table-td">
                                            <div className="text-gray-900">{contact.email}</div>
                                            <div className="text-gray-500">{contact.phoneNumber}</div>
                                        </td>
                                        <td className="table-td" style={{ whiteSpace: 'pre-wrap', minWidth: '300px' }}>
                                            {contact.note || <span style={{ color: '#9ca3af' }}>Không có</span>}
                                        </td>
                                        <td className="table-td text-gray-600">{formatDate(contact.createdAt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">Chưa có thông tin liên hệ nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}