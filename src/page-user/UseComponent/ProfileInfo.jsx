// src/page-user/UseComponent/ProfileInfo.jsx
import React from 'react';
import './ProfileInfo.css';
import { Header } from './Profile';

// Helper component không thay đổi
const DetailRow = ({ label, value, placeholder = "Chưa có" }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    {value && value.length > 0 ? (
      <span className="detail-value">{value}</span>
    ) : (
      <span className="detail-value detail-value-placeholder">{placeholder}</span>
    )}
  </div>
);

const ProfileInfo = ({
  user,
  isEditing,
  tempUser,
  previewAvatar,
  setTempUser,
  handleEdit,
  handleCancelEdit,
  handleSaveUser,
  setPreviewAvatar
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
      setTempUser({ ...tempUser, avatarFile: file });
    }
  };

  const handleArrayChange = (field, value) => {
    setTempUser({ ...tempUser, [field]: value.split(',').map(s => s.trim()) });
  };

  return (
    <div>
      <Header title="Thông tin" />
      <div className="account-detail-card">
        <header className="account-detail-header">
          <div className="avatar-container">
            <img
              src={previewAvatar || user?.avatar || "https://placehold.co/100x100/e2e8f0/64748b?text=Avatar"}
              alt={user?.username}
              className="account-detail-avatar"
            />
            {isEditing && (
              <label htmlFor="avatar-upload" className="change-avatar-btn">
                ✏️
                <input id="avatar-upload" type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>
          <div className="account-detail-info">
            <h1 className="account-detail-name">{user?.username}</h1>
            <p className="account-detail-email">{user?.email}</p>
          </div>
        </header>

        <main className="account-detail-body">
          {isEditing ? (
            // --- Chế độ CHỈNH SỬA ---
            <>
              <div className="info-column">
                <h3 className="column-title">Thông tin cá nhân</h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input value={tempUser?.fullName || ""} onChange={(e) => setTempUser({ ...tempUser, fullName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input value={tempUser?.phone || ""} onChange={(e) => setTempUser({ ...tempUser, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="info-column">
                <h3 className="column-title">Sở thích du lịch</h3>
                <div className="edit-form-grid">
                  <div className="form-group">
                    <label>Ngân sách/Phong cách</label>
                    <input value={tempUser?.budget || ""} onChange={(e) => setTempUser({ ...tempUser, budget: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Loại hình du lịch (cách nhau bởi dấu phẩy)</label>
                    <input value={(Array.isArray(tempUser?.travelStyles) ? tempUser.travelStyles.join(', ') : '')} onChange={(e) => handleArrayChange('travelStyles', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Sở thích (cách nhau bởi dấu phẩy)</label>
                    <input value={(Array.isArray(tempUser?.interests) ? tempUser.interests.join(', ') : '')} onChange={(e) => handleArrayChange('interests', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Đi cùng với (cách nhau bởi dấu phẩy)</label>
                    <input value={(Array.isArray(tempUser?.companions) ? tempUser.companions.join(', ') : '')} onChange={(e) => handleArrayChange('companions', e.target.value)} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // --- Chế độ XEM ---
            <>
              <div className="info-column">
                <h3 className="column-title">Thông tin cá nhân</h3>
                <DetailRow label="Tên tài khoản" value={user?.username} />
                <DetailRow label="Email" value={user?.email} />
                <DetailRow label="Họ và tên" value={user?.fullName} />
                <DetailRow label="Số điện thoại" value={user?.phone} />
              </div>
              <div className="info-column">
                <h3 className="column-title">Sở thích du lịch</h3>
                <DetailRow label="Ngân sách/Phong cách" value={user?.budget} />
                <DetailRow label="Loại hình du lịch" value={user?.travelStyles?.join?.(', ')} />
                <DetailRow label="Sở thích" value={user?.interests?.join?.(', ')} />
                <DetailRow label="Đi cùng với" value={user?.companions?.join?.(', ')} />
              </div>
            </>
          )}
        </main>

        <footer className="card-footer">
          {isEditing ? (
            <>
              <button onClick={handleCancelEdit} className="action-button btn-secondary">Hủy</button>
              <button onClick={handleSaveUser} className="action-button btn-primary">Lưu thay đổi</button>
            </>
          ) : (
            <button onClick={handleEdit} className="action-button btn-primary">Chỉnh sửa thông tin</button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ProfileInfo;