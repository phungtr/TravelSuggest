// src/page-staff/Announcements.jsx
import React, { useState, useEffect } from 'react';
// 1. Thêm icon FaCalendarAlt cho sự kiện
import { FaRegFileAlt, FaCog, FaBullhorn, FaCalendarAlt } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import { getStaffNotifications } from '../services/api';

// 2. Thêm cấu hình cho loại 'EVENT'
const notificationConfig = {
    POLICY: {
        icon: <FaRegFileAlt />,
        title: "Chính sách & Quy định mới",
        iconBg: "#e0f2fe" // Xanh da trời
    },
    SYSTEM: {
        icon: <FaCog />,
        title: "Thông báo hệ thống",
        iconBg: "#dcfce7" // Xanh lá
    },
    INFO: {
        icon: <FaBullhorn />,
        title: "Thông báo chung",
        iconBg: "#fef3c7" // Vàng
    },
    EVENT: { // Bổ sung loại mới
        icon: <FaCalendarAlt />,
        title: "Sự kiện & Hoạt động",
        iconBg: "#fce7f3" // Hồng
    },
    DEFAULT: {
        icon: <FaBullhorn />,
        title: "Thông báo",
        iconBg: "#e5e7eb" // Xám
    }
};

const Announcements = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user || !user.userId) {
                    throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
                }

                const response = await getStaffNotifications(user.userId);
                
                const sortedNotifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(sortedNotifications);

            } catch (err) {
                setError(err.message || "Không thể tải thông báo.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="widget-card">
                <h3 className="widget-title">Thông báo từ công ty</h3>
                <p>Đang tải thông báo...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="widget-card">
                <h3 className="widget-title">Thông báo từ công ty</h3>
                <p style={{ color: 'red' }}>Lỗi: {error}</p>
            </div>
        );
    }

    return (
        <div className="widget-card">
            <h3 className="widget-title">Thông báo từ công ty</h3>
            <div className="announcement-list">
                {notifications.length > 0 ? (
                    notifications.map((item) => {
                        const config = notificationConfig[item.type.toUpperCase()] || notificationConfig.DEFAULT;
                        return (
                            <div key={item.id} className="announcement-item">
                                <div className="announcement-icon" style={{ backgroundColor: config.iconBg }}>
                                    {config.icon}
                                </div>
                                <div className="announcement-content">
                                    <p className="announcement-title">{item.title || config.title}</p>
                                    <p className="announcement-description">{item.content}</p>
                                    <span className="announcement-time">
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>Không có thông báo mới.</p>
                )}
            </div>
        </div>
    );
};

export default Announcements;