// src/components/Modal.jsx
import React from 'react';
import './Modal.css'; // CSS cho Modal, sẽ tạo ở bước tiếp theo
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay-chart" onClick={onClose}>
      <div className="modal-container-chart" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-chart">
          <h3 className="modal-title-chart">{title || 'Chi tiết'}</h3>
          <button className="modal-close-chart" onClick={onClose}>
            <FaTimes />
          </button>
        </header>
        <main className="modal-content-chart">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;
