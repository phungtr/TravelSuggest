// src/page-staff/DocumentPreviewModal.jsx

import React from 'react';
import './Dashboard.css'; // Tái sử dụng một số style có sẵn

const DocumentPreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Đối với file Word, Excel,... chúng ta dùng Google Docs Viewer để xem trước.
    // Yêu cầu file phải có thể truy cập công khai từ internet để Google có thể đọc.
    // Với môi trường localhost, bạn cần đảm bảo server của bạn cho phép truy cập từ bên ngoài.
    const previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true`;

    return (
        <div className="media-modal-overlay" onClick={onClose}>
            <div className="document-preview-content" onClick={(e) => e.stopPropagation()}>
                <div className="document-preview-header">
                    <h3>{file.name}</h3>
                    <a href={file.url} download={file.name} className="action-button approve-button">
                        Tải xuống
                    </a>
                </div>
                {fileExtension === 'pdf' ? (
                    // Trình duyệt có thể đọc PDF trực tiếp
                    <iframe src={file.url} title={file.name} width="100%" height="100%" />
                ) : (
                    // Các loại file khác dùng Google Viewer
                    <iframe src={previewUrl} title={file.name} width="100%" height="100%" frameBorder="0" />
                )}
            </div>
            <button className="media-modal-close" onClick={onClose}>×</button>
        </div>
    );
};

export default DocumentPreviewModal;