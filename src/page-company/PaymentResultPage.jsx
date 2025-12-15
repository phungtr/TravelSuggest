// src/page-company/PaymentResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './IntroducePage.css'; // Tái sử dụng một số style chung

export default function PaymentResultPage() {
    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const responseCode = params.get('vnp_ResponseCode');
        const orderInfo = params.get('vnp_OrderInfo');

        if (responseCode === '00') {
            setStatus('success');
            setMessage(`Thanh toán thành công cho đơn hàng "${orderInfo}". Quảng cáo của bạn đã được gửi đi chờ duyệt.`);
        } else {
            setStatus('failed');
            setMessage('Thanh toán thất bại. Giao dịch đã bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại.');
        }
    }, [location]);

    return (
        <div className="payment-result-container" style={{ textAlign: 'center', padding: '50px 20px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {status === 'success' && <img src="/images/check.png" alt="Success" style={{ width: '100px', marginBottom: '20px' }} />}
            {status === 'failed' && <img src="/images/close.png" alt="Failed" style={{ width: '100px', marginBottom: '20px' }} />}
            
            <h1 style={{ color: status === 'success' ? '#22c55e' : '#ef4444', marginBottom: '1rem' }}>
                {status === 'success' ? 'Giao dịch thành công' : 'Giao dịch thất bại'}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 2rem' }}>
                {message}
            </p>
            {/* --- THAY ĐỔI Ở ĐÂY --- */}
            <Link to="/company/dashboard" className="button button--primary">
                Quay về trang quản lý
            </Link>
        </div>
    );
}