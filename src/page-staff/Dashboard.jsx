// src/page-staff/Dashboard.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaStar, FaAd } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // 1. Import Link từ react-router-dom

import Announcements from './Announcements';
import Documents from './Documents';
import './Dashboard.css';

const Dashboard = () => {
    const { counts, loading } = useOutletContext();

    // 2. Thêm thuộc tính 'path' vào mỗi đối tượng thẻ
    const statCards = [
        { title: "Tài khoản Công ty chờ duyệt", count: counts.accounts, icon: <FaBuilding />, color: "blue", path: "/staff/accounts" },
        { title: "Địa điểm chờ duyệt", count: counts.locations, icon: <FaMapMarkerAlt />, color: "green", path: "/staff/locations" },
        { title: "Đánh giá chờ duyệt", count: counts.reviews, icon: <FaStar />, color: "yellow", path: "/staff/reviews" },
        // { title: "Quảng cáo chờ duyệt", count: counts.ads, icon: <FaAd />, color: "red", path: "/staff/ads" },
    ];

    return (
        <div className="dashboard-page-container">
            <div className="stats-grid">
                {loading ? (
                    <p>Đang tải dữ liệu...</p>
                ) : (
                    statCards.map((card, index) => (
                        // 3. Bọc mỗi thẻ trong component <Link>
                        <Link key={index} to={card.path} className="stat-card-link">
                            <div className="stat-card">
                                <div>
                                    <p className="stat-title">{card.title}</p>
                                    <p className="stat-count">{card.count}</p>
                                </div>
                                <div className={`stat-icon-wrapper icon-${card.color}`}>
                                    {card.icon}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <div className="dashboard-content-grid">
                <Announcements />
                <Documents />
            </div>
        </div>
    );
};

export default Dashboard;