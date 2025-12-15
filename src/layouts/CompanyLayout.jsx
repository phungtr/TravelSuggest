import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import CompanyChatbot from '../components/CompanyChatbot';
import WeeklyReportModal from '../components/WeeklyReportModal';
import './CompanyLayout.css';

const getPageTitle = (pathname) => {
    if (pathname.startsWith('/company/profile')) return 'Hồ sơ công ty';
    if (pathname.startsWith('/company/add-location')) return 'Thêm địa điểm mới';
    if (pathname.startsWith('/company/add-ad')) return 'Tạo chiến dịch mới';
    switch (pathname) {
        case '/company/dashboard': return 'Tổng quan';
        case '/company/locations': return 'Quản lý Địa điểm';
        case '/company/ads': return 'Quản lý Quảng cáo';
        default: return 'Trang doanh nghiệp';
    }
};

export default function CompanyLayout({ user, onLogout }) {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);
    const navigate = useNavigate();
    const [activeInsight, setActiveInsight] = useState(null);
    const [reportModalData, setReportModalData] = useState(null);

    const handleNotificationClick = (notification) => {
        setActiveInsight(notification);
    };
    const handleInsightHandled = () => {
        setActiveInsight(null);
    };
    const handleOpenReportModal = (insightData) => {
        setReportModalData(insightData);
    };
    const handleCloseReportModal = () => {
        setReportModalData(null);
    };

    return (
        <div className="company-layout">
            <Sidebar userRole={user?.role} onLogout={onLogout} />
            <div className="main-content">
                <header className="company-header">
                     <h1 className="page-title">{pageTitle}</h1>
                     
                     {/* --- BẮT ĐẦU THAY ĐỔI --- */}
                     {/* Bọc các phần tử bên phải vào một div chung */}
                     <div className="header-right-panel">
                         <NotificationBell onNotificationClick={handleNotificationClick} />

                         <div 
                            className="user-info" 
                            onClick={() => navigate('/company/profile')} 
                            style={{cursor: 'pointer'}}
                         >
                             <span className="user-greeting">Xin chào, {user?.username}!</span>
                             <img 
                                src={user?.avatar || 'https://placehold.co/40x40/3b82f6/ffffff?text=C'} 
                                alt="User Avatar" 
                                className="user-avatar" 
                             />
                         </div>
                     </div>
                     {/* --- KẾT THÚC THAY ĐỔI --- */}
                </header>

                <main className="page-content">
                    <Outlet context={{ user }} />
                </main>
            </div>
            
            <CompanyChatbot 
                companyId={user?.userId}
                initialInsight={activeInsight}
                onInsightHandled={handleInsightHandled}
                onOpenReportModal={handleOpenReportModal}
            />

            <WeeklyReportModal 
                isOpen={!!reportModalData}
                onClose={handleCloseReportModal}
                insight={reportModalData}
            />
        </div>
    );
}