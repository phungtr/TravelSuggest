// src/page-admin/CommunicationPage.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { FaUpload, FaFilePdf, FaFileWord, FaRegFileAlt, FaDownload, FaTrash, FaFolder, FaFolderPlus, FaChevronRight, FaPencilAlt } from 'react-icons/fa';

import DocumentPreviewModal from '../page-staff/DocumentPreviewModal';
import {
    sendNotificationToRole, uploadDocument, listDocuments, getDocumentDownloadUrl,
    deleteDocument, createFolder, renameDocument, moveFile
} from '../services/api';
import './CommunicationPage.css';

// --- Component Breadcrumb (Không thay đổi) ---
const Breadcrumb = ({ path, onNavigate }) => {
    const parts = typeof path === 'string' ? path.split('/').filter(p => p) : [];
    const handleNavigate = (index) => { const newPath = parts.slice(0, index + 1).join('/'); onNavigate(newPath); };
    return (
        <nav className="breadcrumb">
            <span className="breadcrumb-item" onClick={() => onNavigate('docs')}>Tài liệu nội bộ</span>
            {parts.slice(1).map((part, index) => (
                <React.Fragment key={index}>
                    <FaChevronRight className="breadcrumb-separator" />
                    <span className="breadcrumb-item" onClick={() => handleNavigate(index + 1)}>{part}</span>
                </React.Fragment>
            ))}
        </nav>
    );
};

// --- Component DocumentManager (Không thay đổi) ---
const DocumentManager = () => {
    // ... Toàn bộ logic của DocumentManager giữ nguyên ...
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('docs');
    const fileInputRef = useRef(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [dragOverTarget, setDragOverTarget] = useState(null);

    const fetchData = useCallback(async (path) => {
        setLoading(true);
        try {
            const response = await listDocuments(path);
            const formattedItems = response.data.map(item => ({
                ...item,
                displayName: item.name,
                downloadUrl: item.type === 'file' ? getDocumentDownloadUrl(item.path, 'attachment') : null,
                previewUrl: item.type === 'file' ? getDocumentDownloadUrl(item.path, 'inline') : null,
            }));
            formattedItems.sort((a, b) => {
                if (a.type === 'directory' && b.type !== 'directory') return -1;
                if (a.type !== 'directory' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            });
            setItems(formattedItems);
        } catch (error) {
            Swal.fire('Lỗi', `Không thể tải danh sách: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(currentPath); }, [fetchData, currentPath]);

    const handleDragStart = (e, item) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, targetItem) => {
        e.preventDefault();
        if (targetItem.type === 'directory') {
            setDragOverTarget(targetItem.path);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverTarget(null);
    };
    
    const handleDrop = async (e, targetFolder) => {
        e.preventDefault();
        setDragOverTarget(null);

        try {
            const draggedItem = JSON.parse(e.dataTransfer.getData('application/json'));
            if (draggedItem.type !== 'file' || targetFolder.type !== 'directory') return;
            
            const sourcePath = draggedItem.path;
            const targetFolderPath = targetFolder.path;

            await moveFile(sourcePath, targetFolderPath);

            Swal.fire('Thành công', `Đã di chuyển file "${draggedItem.displayName}" vào thư mục "${targetFolder.displayName}".`, 'success');
            fetchData(currentPath);

        } catch (err) {
            Swal.fire('Lỗi', `Không thể di chuyển file: ${err.message}`, 'error');
        }
    };

    const handleNavigate = (newPath) => setCurrentPath(newPath);
    const handlePreview = (file) => setPreviewFile({ name: file.displayName, url: file.previewUrl });
    const handleCreateFolder = async () => {
        const { value: folderName } = await Swal.fire({
            title: 'Nhập tên thư mục mới', input: 'text',
            inputPlaceholder: 'Ví dụ: Báo cáo tháng 9', showCancelButton: true,
            confirmButtonText: 'Tạo', cancelButtonText: 'Hủy'
        });
        if (folderName) {
            try {
                await createFolder(`${currentPath}/${folderName}`);
                Swal.fire('Thành công!', `Đã tạo thư mục "${folderName}".`, 'success');
                fetchData(currentPath);
            } catch (err) { Swal.fire('Lỗi!', `Không thể tạo thư mục: ${err.message}`, 'error'); }
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        Swal.fire({ title: `Đang tải lên "${file.name}"...`, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            await uploadDocument(file, currentPath);
            Swal.fire('Thành công!', 'Tải lên tài liệu thành công.', 'success');
            fetchData(currentPath);
        } catch (err) { Swal.fire('Lỗi!', `Không thể tải lên: ${err.message}`, 'error'); }
        finally { event.target.value = null; }
    };

    const handleDelete = async (item) => {
        const itemType = item.type === 'directory' ? 'thư mục' : 'file';
        const result = await Swal.fire({
            title: `Bạn chắc chắn muốn xóa ${itemType} này?`,
            text: `"${item.displayName}" sẽ bị xóa vĩnh viễn!`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33',
            confirmButtonText: 'Xóa ngay', cancelButtonText: 'Hủy bỏ'
        });
        if (result.isConfirmed) {
            try {
                await deleteDocument(item.path, item.type === 'directory');
                Swal.fire('Đã xóa!', `${itemType} đã được xóa thành công.`, 'success');
                fetchData(currentPath);
            } catch (err) { Swal.fire('Lỗi!', `Không thể xóa: ${err.message}`, 'error'); }
        }
    };

    const handleRename = async (item) => {
        const { value: newName } = await Swal.fire({
            title: `Đổi tên cho "${item.displayName}"`,
            input: 'text',
            inputValue: item.displayName,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => { if (!value) return 'Tên không được để trống!'; }
        });

        if (newName && newName !== item.displayName) {
            try {
                const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));
                const newPath = `${parentPath}/${newName}`;
                await renameDocument(item.path, newPath, item.type);
                Swal.fire('Thành công!', 'Đổi tên thành công.', 'success');
                fetchData(currentPath);
            } catch (err) {
                Swal.fire('Lỗi!', `Không thể đổi tên: ${err.message}`, 'error');
            }
        }
    };

    const getItemIcon = (item) => {
        if (item.type === 'directory') return <FaFolder className="file-icon folder" />;
        const extension = item.name.split('.').pop().toLowerCase();
        if (extension === 'pdf') return <FaFilePdf className="file-icon pdf" />;
        if (['doc', 'docx'].includes(extension)) return <FaFileWord className="file-icon word" />;
        return <FaRegFileAlt className="file-icon" />;
    };

    return (
        <div className="card">
            <div className="card-header">
                <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
                <div className="action-buttons-group">
                    <button onClick={handleCreateFolder} className="action-button"><FaFolderPlus /> Tạo thư mục</button>
                    <button onClick={() => fileInputRef.current.click()} className="action-button approve-button"><FaUpload /> Tải lên</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                </div>
            </div>
            <div className="table-responsive">
                <table className="data-table">
                     <thead><tr><th className="table-th">Tên</th><th className="table-th text-center" style={{ width: '150px' }}>Hành động</th></tr></thead>
                    <tbody className="table-body">
                        {loading ? (
                            <tr><td colSpan="2" className="loading-state">Đang tải...</td></tr>
                        ) : items.length > 0 ? (
                            items.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`table-row ${dragOverTarget === item.path ? 'drop-target-highlight' : ''}`}
                                    draggable={item.type === 'file'}
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragOver={(e) => handleDragOver(e, item)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, item)}
                                >
                                    <td className="table-td">
                                        <div className="file-name-cell" style={{ cursor: 'pointer' }} onClick={item.type === 'directory' ? () => handleNavigate(item.path) : () => handlePreview(item)}>
                                            {getItemIcon(item)}
                                            <span className="document-link">{item.displayName}</span>
                                        </div>
                                    </td>
                                    <td className="table-td text-center">
                                        <div className="action-buttons-group">
                                            {item.type === 'file' && (
                                                <a href={item.downloadUrl} download={item.displayName} className="action-button icon-button" title="Tải xuống"><FaDownload /></a>
                                            )}
                                            <button onClick={() => handleRename(item)} className="action-button icon-button" title="Đổi tên"><FaPencilAlt /></button>
                                            <button onClick={() => handleDelete(item)} className="action-button icon-button reject-button" title="Xóa"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="2" className="empty-state">Thư mục này trống.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {previewFile && <DocumentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
        </div>
    );
};


// --- Component chính ---
export default function CommunicationPage() {
    const [formData, setFormData] = useState({ type: 'INFO', title: '', content: '' });
    const [user] = useState(() => JSON.parse(localStorage.getItem("user") || null));
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.userId) { Swal.fire('Lỗi', 'Không tìm thấy thông tin admin. Vui lòng đăng nhập lại.', 'error'); return; }
        const payload = { ...formData, targetRole: 'STAFF' };
        try {
            const response = await sendNotificationToRole(user.userId, payload);
            Swal.fire({ title: 'Gửi thành công!', html: `Thông báo đã được gửi tới <b>${response.data.totalReceivers}</b> nhân viên.`, icon: 'success' });
            setFormData({ type: 'INFO', title: '', content: '' });
        } catch (err) { Swal.fire('Gửi thất bại!', err.response?.data?.message || err.message, 'error'); }
    };
    return (
        <div className="communication-page-container">
            <div className="card">
                <div className="card-header"><h2 className="card-title">Gửi thông báo đến nhân viên</h2><p className="card-description">Soạn và gửi thông báo trực tiếp đến tất cả tài khoản nhân viên.</p></div>
                <form onSubmit={handleSubmit} className="communication-form">
                    <div className="form-group">
                        <label htmlFor="type">Loại thông báo</label>
                        <select id="type" name="type" value={formData.type} onChange={handleInputChange}>
                            <option value="INFO">Thông báo chung</option>
                            <option value="SYSTEM">Bảo trì hệ thống</option>
                            <option value="POLICY">Chính sách mới</option>
                            {/* Dòng được thêm vào */}
                            <option value="EVENT">Sự kiện & Hoạt động</option>
                        </select>
                    </div>
                    <div className="form-group"><label htmlFor="title">Tiêu đề (Không bắt buộc)</label><input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ví dụ: Lịch nghỉ lễ"/></div>
                    <div className="form-group"><label htmlFor="content">Nội dung</label><textarea id="content" name="content" rows="5" value={formData.content} onChange={handleInputChange} required placeholder="Nhập nội dung thông báo tại đây..."></textarea></div>
                    <div className="form-actions"><button type="submit" className="btn btn-primary">Gửi thông báo</button></div></form>
            </div>
            <DocumentManager />
        </div>
    );
}