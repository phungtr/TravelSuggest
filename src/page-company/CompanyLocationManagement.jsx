// src/page-company/CompanyLocationManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // <-- 1. Thêm import
import { getCompanyLocations, deleteLocation } from '../services/api';
import '../page-staff/account-management.css';

const StatusBadge = ({ status }) => {
    const statusInfo = {
        PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' },
        ACTIVE: { text: 'Đang hoạt động', className: 'status-badge status-active' },
        INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' },
    }[status] || { text: status, className: 'status-badge status-default' };
    return <span className={statusInfo.className}>{statusInfo.text}</span>;
};

const CompanyLocationManagement = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const locationsRes = await getCompanyLocations();
            setLocations(locationsRes.data);
        } catch (err) {
            setError(err.message || "Đã xảy ra lỗi không xác định.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // <-- 2. Thay thế window.confirm và alert -->
    const handleDeleteLocation = async (locationId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa địa điểm này?',
            text: "Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy bỏ'
        });
        
        if (result.isConfirmed) {
            try {
                await deleteLocation(locationId);
                Swal.fire(
                    'Đã xóa!',
                    'Địa điểm của bạn đã được xóa.',
                    'success'
                );
                fetchData();
            } catch (err) {
                Swal.fire(
                    'Lỗi!',
                    `Lỗi khi xóa địa điểm: ${err.message}`,
                    'error'
                );
            }
        }
    };
    
    if (loading) return <div className="loading-state">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-state">Lỗi: {error}</div>;

    return (
        <div className="content-wrapper">
            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="card-title">Địa điểm của bạn</h2>
                        <p className="card-description">Thêm, sửa và quản lý các địa điểm thuộc doanh nghiệp của bạn.</p>
                    </div>
                    <button onClick={() => navigate('/company/add-location')} className="action-button approve-button">Thêm địa điểm mới</button>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr className="table-header">
                                <th className="table-th">Tên địa điểm</th>
                                <th className="table-th">Địa chỉ</th>
                                <th className="table-th">Trạng thái</th>
                                <th className="table-th text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {locations.length > 0 ? locations.map(loc => (
                                <tr key={loc.locationId} className="table-row">
                                    <td className="table-td font-medium">
                                        <Link to={`/company/locations/${loc.locationId}`} className="text-link">
                                            {loc.name}
                                        </Link>
                                    </td>
                                    <td className="table-td">{loc.location}</td>
                                    <td className="table-td"><StatusBadge status={loc.status} /></td>
                                    <td className="table-td text-center">
                                        <button onClick={() => handleDeleteLocation(loc.locationId)} className="action-button reject-button">Xóa</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">Bạn chưa tạo địa điểm nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompanyLocationManagement;