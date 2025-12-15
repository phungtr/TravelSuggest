import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UnauthorizedPage.css';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="unauthorized-container">
            <div className="unauthorized-card">
                <div className="unauthorized-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <h1 className="unauthorized-title">Truy Cập Bị Từ Chối</h1>
                <p className="unauthorized-message">
                    Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập để tiếp tục.
                </p>
                <button className="unauthorized-button" onClick={() => navigate('/login')}>
                    Đi đến trang đăng nhập
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;