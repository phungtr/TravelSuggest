// src/page-staff/Documents.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaFilePdf, FaFileWord, FaRegFileAlt, FaDownload, FaFolder } from 'react-icons/fa';

import { listDocuments, getDocumentDownloadUrl } from '../services/api';
import DocumentPreviewModal from './DocumentPreviewModal';
import './Dashboard.css';

// --- Component Breadcrumb (Không thay đổi) ---
const Breadcrumb = ({ path, onNavigate }) => {
    const parts = typeof path === 'string' ? path.split('/').filter(p => p) : [];
    const handleNavigate = (index) => {
        const newPath = parts.slice(0, index + 1).join('/');
        onNavigate(newPath);
    };
    return (
        <nav className="breadcrumb">
            <span className="breadcrumb-item" onClick={() => onNavigate('docs')}>Tài liệu nội bộ</span>
            {parts.slice(1).map((part, index) => (
                <React.Fragment key={index}>
                    <i className="fa fa-chevron-right breadcrumb-separator"></i>
                    <span className="breadcrumb-item" onClick={() => handleNavigate(index + 1)}>{part}</span>
                </React.Fragment>
            ))}
        </nav>
    );
};


// --- Component chính (Đã cập nhật) ---
const Documents = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [currentPath, setCurrentPath] = useState('docs');

    const fetchData = useCallback(async (path) => {
        setLoading(true);
        setError(null);
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
        } catch (err) {
            setError("Không thể tải danh sách tài liệu.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPath);
    }, [fetchData, currentPath]);

    const handleNavigate = (newPath) => setCurrentPath(newPath);

    const handlePreview = (file) => {
        setPreviewFile({
            name: file.displayName,
            url: file.previewUrl
        });
    };

    const getItemIcon = (item) => {
        if (item.type === 'directory') return <FaFolder style={{ color: '#f59e0b' }} />;
        const extension = item.name.split('.').pop().toLowerCase();
        if (extension === 'pdf') return <FaFilePdf style={{ color: '#ef4444' }} />;
        if (['doc', 'docx'].includes(extension)) return <FaFileWord style={{ color: '#3b82f6' }} />;
        return <FaRegFileAlt />;
    };
    
    return (
        <div className="widget-card">
            <div className="widget-header" style={{marginBottom: '1rem', justifyContent: 'flex-start'}}>
                 <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
            </div>

            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {!loading && !error && (
                <div className="table-responsive" style={{maxHeight: '320px', overflowY: 'auto'}}>
                    <table className="document-table">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                {/* 1. Thêm cột Người tạo */}
                                <th style={{width: '150px'}}>Người tạo</th>
                                <th style={{ textAlign: 'right', width: '80px' }}>Tải về</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr key={index}>
                                        <td 
                                            className="document-name-cell"
                                            style={{ cursor: 'pointer' }}
                                            onClick={item.type === 'directory' ? () => handleNavigate(item.path) : () => handlePreview(item)}
                                        >
                                            {getItemIcon(item)}
                                            <span className="document-link">{item.displayName}</span>
                                        </td>
                                        {/* 2. Hiển thị dữ liệu Người tạo (cố định) */}
                                        <td>Admin</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {item.type === 'file' && (
                                                <a href={item.downloadUrl} download={item.displayName} className="action-button approve-button icon-button">
                                                    <FaDownload />
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    {/* 3. Cập nhật colSpan */}
                                    <td colSpan="3" className="empty-state" style={{padding: '2rem'}}>Thư mục này trống.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {previewFile && (
                <DocumentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
            )}
        </div>
    );
};

export default Documents;