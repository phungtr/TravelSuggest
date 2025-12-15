// src/layouts/StaffLayout.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { formatDistanceToNow, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    getPendingCompanyAccounts,
    getPendingLocations,
    getPendingReviews,
    getPendingAds,
    getCompanyRegisteredNotifications,
    getUserRegisteredNotifications,
    getAdsCreatedNotifications,
    getLocationsCreatedNotifications,
    getReviewsCreatedNotifications,
    getAllContactInfo
} from '../services/api';
import './StaffLayout.css';

// --- Các component con (giữ nguyên) ---
const BellIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>);
const TimeAgo = ({ date }) => { if (!date) return null; try { const dateObj = new Date(date); const timeAgo = formatDistanceToNow(dateObj, { addSuffix: true, locale: vi }); return <span className="notification-time">{timeAgo}</span>; } catch (error) { console.error("Invalid date for TimeAgo:", date); return null; }};

const NotificationPanel = ({ notifications, onShowMore, showAll, totalCount }) => (
    <div className="notification-panel">
        <div className="notification-header"><h3>Thông báo</h3></div>
        <div className="notification-list">
            {notifications && notifications.length > 0 ? (
                notifications.map((noti, index) => (
                    <div key={index} className="notification-item">
                        <p className="notification-message">{noti.content}</p>
                        <TimeAgo date={noti.createdAt} />
                    </div>
                ))
            ) : (
                <div className="notification-empty">Không có thông báo mới.</div>
            )}
        </div>
        {!showAll && totalCount > 5 && (
            <div className="notification-footer">
                <button onClick={onShowMore} className="show-more-button">
                    Xem tất cả ({totalCount})
                </button>
            </div>
        )}
    </div>
);

const getPageTitle = (pathname) => {
    if (pathname.startsWith('/staff/accounts/')) return 'Chi tiết Tài khoản';
    if (pathname.startsWith('/staff/locations/')) return 'Chi tiết Địa điểm';
    switch (pathname) {
        case '/staff/dashboard': return 'Tổng quan';
        case '/staff/accounts': return 'Quản lý Tài khoản';
        case '/staff/locations': return 'Kiểm duyệt Địa điểm';
        case '/staff/reviews': return 'Kiểm duyệt Đánh giá';
        case '/staff/ads': return 'Kiểm duyệt Quảng cáo';
        case '/staff/contacts': return 'Hòm thư liên hệ';
        default: return 'Trang quản trị';
    }
};

// --- Component chính ---
// **BẮT ĐẦU SỬA LỖI** - Nhận prop `user`
export default function StaffLayout({ user, onLogout }) { 
    const [counts, setCounts] = useState({ accounts: 0, locations: 0, reviews: 0, ads: 0, contacts: 0 });
    const [loading, setLoading] = useState(true);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const location = useLocation();
    const notificationRef = useRef(null);

    const [allRecentNotifications, setAllRecentNotifications] = useState([]);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const [hasNewContacts, setHasNewContacts] = useState(false);

    const handleViewContacts = () => {
        localStorage.setItem('lastSeenContactCount', counts.contacts.toString());
        setHasNewContacts(false);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                accountsRes,
                locationsRes,
                reviewsRes,
                adsRes,
                contactsRes,
                companyNotiRes,
                userNotiRes,
                adsNotiRes,
                locationsNotiRes,
                reviewsNotiRes
            ] = await Promise.all([
                getPendingCompanyAccounts(),
                getPendingLocations(),
                getPendingReviews(),
                getPendingAds(),
                getAllContactInfo(),
                getCompanyRegisteredNotifications(),
                getUserRegisteredNotifications(),
                getAdsCreatedNotifications(),
                getLocationsCreatedNotifications(),
                getReviewsCreatedNotifications(),
            ]);

            const newCounts = {
                accounts: accountsRes.data?.length || 0,
                locations: locationsRes.data?.length || 0,
                reviews: reviewsRes.data?.length || 0,
                ads: adsRes.data?.length || 0,
                contacts: contactsRes.data?.length || 0
            };
            setCounts(newCounts);

            const lastSeenCount = parseInt(localStorage.getItem('lastSeenContactCount') || '0', 10);
            if (newCounts.contacts > lastSeenCount) {
                setHasNewContacts(true);
            }

            const allNotifications = [
                ...(companyNotiRes.data.result || []),
                ...(userNotiRes.data.result || []),
                ...(adsNotiRes.data.result || []),
                ...(locationsNotiRes.data.result || []),
                ...(reviewsNotiRes.data.result || [])
            ];

            const sevenDaysAgo = subDays(new Date(), 7);
            const recentNotifications = allNotifications
                .filter(noti => new Date(noti.createdAt) > sevenDaysAgo)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setAllRecentNotifications(recentNotifications);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu layout:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleNotificationPanel = () => {
        setIsNotificationOpen(prev => !prev);
        if (!isNotificationOpen) {
            setShowAllNotifications(false);
        }
    };

    const displayedNotifications = showAllNotifications
        ? allRecentNotifications
        : allRecentNotifications.slice(0, 5);

    useEffect(() => {
        const handleClickOutside = (event) => { if (notificationRef.current && !notificationRef.current.contains(event.target)) { setIsNotificationOpen(false); }};
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    const pageTitle = getPageTitle(location.pathname);

    return (
        <div className="staff-layout">
            <Sidebar
                // **BẮT ĐẦU SỬA LỖI** - Truyền userRole vào Sidebar
                userRole={user?.role}
                // **KẾT THÚC SỬA LỖI**
                counts={counts}
                hasNewContacts={hasNewContacts}
                onViewContacts={handleViewContacts}
                onLogout={onLogout}
            />
            <div className="main-content">
                <header className="staff-header">
                     <h1 className="page-title">{pageTitle}</h1>
                     <div className="user-info">
                         <div className="notification-wrapper" ref={notificationRef}>
                             <button className="notification-button" onClick={toggleNotificationPanel}>
                                 <BellIcon className="button-icon" />
                                 {allRecentNotifications.length > 0 && (
                                     <span className="notification-count-badge">
                                         {allRecentNotifications.length > 99 ? '99+' : allRecentNotifications.length}
                                     </span>
                                 )}
                             </button>
                             {isNotificationOpen && (
                                <NotificationPanel
                                    notifications={displayedNotifications}
                                    onShowMore={() => setShowAllNotifications(true)}
                                    showAll={showAllNotifications}
                                    totalCount={allRecentNotifications.length}
                                />
                             )}
                         </div>
                         <span className="user-greeting">Xin chào, {user?.username || 'Nhân viên'}!</span>
                         <img src={"/images/image.png"} alt="User Avatar" className="user-avatar" />
                     </div>
                </header>

                <main className="page-content">
                    <Outlet context={{ counts, loading, notifications: allRecentNotifications }} />
                </main>
            </div>
        </div>
    );
}