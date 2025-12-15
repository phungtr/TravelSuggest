import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css'; 

// --- BẮT ĐẦU SỬA LỖI ---
// Hàm để loại bỏ các ký tự Markdown khỏi văn bản
const stripMarkdown = (text = "") => {
  return text
    .replace(/#+\s/g, '')      // Loại bỏ các dấu # ở đầu (ví dụ: ### Báo cáo)
    .replace(/(\*\*|__)/g, '') // Loại bỏ ký tự in đậm
    .replace(/(\*|_)/g, '')    // Loại bỏ ký tự in nghiêng
    .replace(/(\n)/g, ' ')      // Thay thế xuống dòng bằng khoảng trắng
    .replace(/\s+/g, ' ')       // Gom nhiều khoảng trắng thành một
    .trim();
};
// --- KẾT THÚC SỬA LỖI ---

const NotificationBell = ({ onNotificationClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) return;

        const response = await fetch('https://datn-nodejs-yg5k.onrender.com/api/proactive-insights/unread', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };
    fetchNotifications();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const handleItemClick = (notification) => {
    if (onNotificationClick) {
        onNotificationClick(notification);
    }
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    setIsOpen(false); 
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button className="notification-bell-button" onClick={() => setIsOpen(!isOpen)}>
        <FaBell />
        {notifications.length > 0 && (
          <span className="notification-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            Thông báo
          </div>
          {notifications.length > 0 ? (
            <ul className="notification-list">
              {notifications.map(item => (
                <li key={item.id} onClick={() => handleItemClick(item)}>
                  <div className="notification-title">{item.title}</div>
                  
                  {/* --- BẮT ĐẦU SỬA LỖI --- */}
                  {/* Sử dụng hàm stripMarkdown để làm sạch summary */}
                  <div className="notification-summary">
                    {stripMarkdown(item.summary).substring(0, 70)}...
                  </div>
                  {/* --- KẾT THÚC SỬA LỖI --- */}

                </li>
              ))}
            </ul>
          ) : (
            <div className="notification-empty">
              Không có thông báo mới
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;