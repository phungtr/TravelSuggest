import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // <-- 1. Thêm import

// Cập nhật danh sách import: đã bỏ updateAccountStatus
import { 
    getAllAccounts, 
    getPendingCompanyAccounts, 
    approveCompanyAccount,
    rejectCompanyAccount,
} from '../services/api';

import './account-management.css'; 

// --- Icon Components (Không thay đổi) ---
const CheckCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const XCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- Helper Functions (Không thay đổi) ---
const formatDate = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const ROLE_MAP = { USER: 'Người dùng', COMPANY: 'Công ty', STAFF: 'Nhân viên', ADMIN: 'Quản trị viên' };
const STATUS_MAP = { PENDING: { text: 'Chờ duyệt', className: 'status-badge status-pending' }, ACTIVE: { text: 'Đang hoạt động', className: 'status-badge status-active' }, INACTIVE: { text: 'Đã từ chối', className: 'status-badge status-inactive' }, BANNED: { text: 'Đã khóa', className: 'status-badge status-banned' } };
const StatusBadge = ({ status }) => { const statusInfo = STATUS_MAP[status] || { text: status, className: 'status-badge status-default' }; return <span className={statusInfo.className}>{statusInfo.text}</span>; };

// --- Main Component ---
export default function AccountManagementPage() {
    const [accounts, setAccounts] = useState([]);
    const [pendingAccounts, setPendingAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ allAccountsResponse, pendingAccountsResponse ] = await Promise.all([
                getAllAccounts(),
                getPendingCompanyAccounts(),
            ]);
            setAccounts(allAccountsResponse.data);
            setPendingAccounts(pendingAccountsResponse.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi không xác định.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // <-- 2. Thay thế window.confirm và alert -->
    const handleApproveAccount = async (accountId) => {
        Swal.fire({
            title: 'Bạn có chắc muốn duyệt tài khoản này?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await approveCompanyAccount(accountId);
                    Swal.fire('Thành công!', 'Tài khoản đã được duyệt.', 'success');
                    await fetchData();
                } catch (err) {
                    Swal.fire('Lỗi!', 'Lỗi khi duyệt tài khoản: ' + (err.response?.data?.message || err.message), 'error');
                }
            }
        });
    };

    // <-- 3. Thay thế window.confirm và alert -->
    const handleRejectAccount = async (accountId) => {
        Swal.fire({
            title: 'Bạn có chắc muốn từ chối tài khoản này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await rejectCompanyAccount(accountId);
                    Swal.fire('Thành công!', 'Tài khoản đã bị từ chối.', 'success');
                    await fetchData();
                } catch (err) {
                    Swal.fire('Lỗi!', 'Lỗi khi từ chối tài khoản: ' + (err.response?.data?.message || err.message), 'error');
                }
            }
        });
    };
    
    if (loading) { return <div className="loading-state">Đang tải dữ liệu...</div>; }
    if (error) { return <div className="error-state">Lỗi: {error}</div>; }

    return (
        <div className="content-wrapper">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Tài khoản Công ty chờ duyệt</h2>
                    <p className="card-description">Danh sách các tài khoản đối tác cần được phê duyệt.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-th">Tên tài khoản</th>
                                <th scope="col" className="table-th">Email</th>
                                <th scope="col" className="table-th">Ngày đăng ký</th>
                                <th scope="col" className="table-th text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {pendingAccounts.length > 0 ? (
                                pendingAccounts.map((account) => (
                                    <tr key={account.accountId} className="table-row">
                                        <td className="table-td">
                                            <Link to={`/staff/accounts/${account.accountId}`} className="text-link">
                                                {account.username}
                                            </Link>
                                        </td>
                                        <td className="table-td">{account.email}</td>
                                        <td className="table-td text-gray-600">{formatDate(account.createdAt)}</td>
                                        <td className="table-td text-center">
                                            <div className="action-buttons-group">
                                                <button onClick={() => handleApproveAccount(account.accountId)} className="action-button approve-button"><CheckCircleIcon className="button-icon" /> Duyệt</button>
                                                <button onClick={() => handleRejectAccount(account.accountId)} className="action-button reject-button"><XCircleIcon className="button-icon" /> Từ chối</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-state">Không có tài khoản nào đang chờ duyệt.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Tất cả tài khoản</h2>
                    <p className="card-description">Danh sách toàn bộ tài khoản trên hệ thống.</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead className="table-header">
                            <tr>
                                <th scope="col" className="table-th">Tên tài khoản</th>
                                <th scope="col" className="table-th">Loại</th>
                                <th scope="col" className="table-th">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="table-body">
                            {accounts.map((account) => (
                                <tr key={account.accountId} className="table-row">
                                    <td className="table-td">
                                        <div className="font-medium text-gray-900">{account.username}</div>
                                        <div className="text-gray-500">{account.email}</div>
                                    </td>
                                    <td className="table-td text-gray-600">{ROLE_MAP[account.role] || account.role}</td>
                                    <td className="table-td"><StatusBadge status={account.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}