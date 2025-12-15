// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    FaTachometerAlt,
    FaUsersCog,
    FaMapMarkerAlt,
    FaStarHalfAlt,
    FaAd,
    FaSignOutAlt,
    FaMapMarkedAlt,
    FaAddressBook,
    FaBuilding,
    FaUserTie,
    FaUsers,
    FaBullhorn // <-- 1. Thêm icon mới
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ userRole, counts = {}, hasNewContacts, onViewContacts, onLogout }) => {

    const handleLogoutClick = (e) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Bạn chắc chắn muốn đăng xuất?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                onLogout();
            }
        });
    };

    const staffLinks = (
        <>
            <NavLink to="/staff/dashboard" className="sidebar-link">
                <FaTachometerAlt className="sidebar-icon" />
                <span>Tổng quan</span>
            </NavLink>
            <NavLink to="/staff/accounts" className="sidebar-link">
                <FaUsersCog className="sidebar-icon" />
                <span>Quản lý Tài khoản</span>
                {counts.accounts > 0 && <span className="badge">{counts.accounts}</span>}
            </NavLink>
            <NavLink to="/staff/locations" className="sidebar-link">
                <FaMapMarkerAlt className="sidebar-icon" />
                <span>Kiểm duyệt Địa điểm</span>
                {counts.locations > 0 && <span className="badge">{counts.locations}</span>}
            </NavLink>
            <NavLink to="/staff/reviews" className="sidebar-link">
                <FaStarHalfAlt className="sidebar-icon" />
                <span>Kiểm duyệt Đánh giá</span>
                {counts.reviews > 0 && <span className="badge">{counts.reviews}</span>}
            </NavLink>
            <NavLink to="/staff/contacts" className="sidebar-link" onClick={onViewContacts}>
                <FaAddressBook className="sidebar-icon" />
                <span>Hòm thư liên hệ</span>
                {hasNewContacts && (
                    <span className="notification-indicator-wrapper">
                        <span className="notification-ping"></span>
                        <span className="notification-dot"></span>
                    </span>
                )}
            </NavLink>
        </>
    );

    const companyLinks = (
        <>
            <NavLink to="/company/dashboard" className="sidebar-link">
                <FaTachometerAlt className="sidebar-icon" />
                <span>Tổng quan</span>
            </NavLink>
            <NavLink to="/company/locations" className="sidebar-link">
                <FaBuilding className="sidebar-icon" />
                <span>Quản lý Địa điểm</span>
            </NavLink>
            <NavLink to="/company/ads" className="sidebar-link">
                <FaAd className="sidebar-icon" />
                <span>Quản lý Quảng cáo</span>
            </NavLink>
        </>
    );
    
    const adminLinks = (
        <>
            <NavLink to="/admin/dashboard" className="sidebar-link">
                <FaTachometerAlt className="sidebar-icon" />
                <span>Tổng quan Hệ thống</span>
            </NavLink>
             <NavLink to="/admin/users" className="sidebar-link">
                <FaUsers className="sidebar-icon" />
                <span>Quản lý Người dùng</span>
            </NavLink>
            <NavLink to="/admin/companies" className="sidebar-link">
                <FaBuilding className="sidebar-icon" />
                <span>Quản lý Đối tác</span>
            </NavLink>
            <NavLink to="/admin/staff" className="sidebar-link">
                <FaUserTie className="sidebar-icon" />
                <span>Quản lý Nhân viên</span>
            </NavLink>
            {/* --- 2. Thêm link mới cho trang Truyền thông --- */}
            <NavLink to="/admin/communication" className="sidebar-link">
                <FaBullhorn className="sidebar-icon" />
                <span>Truyền thông</span>
            </NavLink>
        </>
    );

    const renderLinks = () => {
        switch (userRole) {
            case 'ADMIN':
                return adminLinks;
            case 'STAFF':
                return staffLinks;
            case 'COMPANY':
                return companyLinks;
            default:
                return null;
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <FaMapMarkedAlt className="logo-icon" />
                <span className="logo-text">TravelSuggest</span>
            </div>

            <nav className="sidebar-nav">
                {renderLinks()}
            </nav>

            <div className="sidebar-footer">
                <a href="#" onClick={handleLogoutClick} className="sidebar-link">
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Đăng xuất</span>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;