
// src/page-company/UseComponent/CompanyProfileInfo.jsx
import React from 'react';
import '../../page-user/UseComponent/ProfileInfo.css';
import { Card, CardContent, Grid, Typography, Box, Button } from '@mui/material';

// Helper component cho chế độ xem
const DetailRow = ({ label, value, placeholder = "Chưa có" }) => (
    <div className="detail-row">
        <span className="detail-label">{label}</span>
        {value ? (
            <span className="detail-value">{value}</span>
        ) : (
            <span className="detail-value detail-value-placeholder">{placeholder}</span>
        )}
    </div>
);

// Helper component cho chế độ chỉnh sửa
const EditableDetailRow = ({ label, name, value, onChange, type = "text" }) => (
    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>{label}</Typography>
        <input 
            type={type} 
            name={name}
            value={value || ""} 
            onChange={onChange} 
            style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: '6px', 
                border: '1px solid #ced4da',
                fontSize: '0.95rem'
            }} 
        />
    </div>
);


const CompanyProfileInfo = ({
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
  
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setTempUser(prev => ({ ...prev, [name]: value }));
  };

  const defaultAvatar = "https://res.cloudinary.com/dduv5y00x/image/upload/v1725091761/image_default_profile.jpg";

  return (
    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px_20px rgba(0,0,0,0.06)' }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <div className="avatar-container" style={{ marginRight: '24px' }}>
            <img
              src={previewAvatar || user?.avatar || defaultAvatar}
              alt={user?.companyName}
              className="account-detail-avatar"
              style={{ width: '90px', height: '90px' }}
            />
            {isEditing && (
              <label htmlFor="avatar-upload" className="change-avatar-btn">
                ✏️
                <input id="avatar-upload" type="file" hidden onChange={handleFileChange} accept="image/*"/>
              </label>
            )}
          </div>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              {isEditing ? tempUser?.companyName : user?.companyName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? tempUser?.email : user?.email}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: '#3f51b5', borderBottom: '2px solid #e0e0e0', pb: 1 }}>Chi tiết tài khoản</Typography>
            {isEditing ? (
                <>
                    <EditableDetailRow label="Tên tài khoản" name="username" value={tempUser?.username} onChange={handleInputChange} />
                    <EditableDetailRow label="Email" name="email" value={tempUser?.email} onChange={handleInputChange} type="email"/>
                    <DetailRow label="Ngày đăng ký" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'} />
                    <DetailRow label="Trạng thái" value={user?.status} />
                </>
            ) : (
                <>
                    <DetailRow label="Tên tài khoản" value={user?.username} />
                    <DetailRow label="Email" value={user?.email} />
                    <DetailRow label="Ngày đăng ký" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa có'} />
                    <DetailRow label="Trạng thái" value={user?.status} />
                </>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: '#3f51b5', borderBottom: '2px solid #e0e0e0', pb: 1 }}>Thông tin công ty</Typography>
            {isEditing ? (
                <>
                    <EditableDetailRow label="Tên công ty" name="companyName" value={tempUser?.companyName} onChange={handleInputChange} />
                    <EditableDetailRow label="Số điện thoại" name="phoneNumber" value={tempUser?.phoneNumber} onChange={handleInputChange} />
                    <EditableDetailRow label="Mã số thuế" name="taxCode" value={tempUser?.taxCode} onChange={handleInputChange} />
                    <EditableDetailRow label="Địa chỉ" name="location" value={tempUser?.location} onChange={handleInputChange} />
                    <EditableDetailRow label="Giấy phép KD" name="businessLicense" value={tempUser?.businessLicense} onChange={handleInputChange} />
                </>
            ) : (
                <>
                    <DetailRow label="Tên công ty" value={user?.companyName} />
                    <DetailRow label="Số điện thoại" value={user?.phoneNumber} />
                    <DetailRow label="Mã số thuế" value={user?.taxCode} />
                    <DetailRow label="Địa chỉ" value={user?.location} />
                    <DetailRow label="Giấy phép KD" value={user?.businessLicense} />
                </>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
          {isEditing ? (
            <>
              <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>Hủy</Button>
              <Button variant="contained" color="primary" onClick={handleSaveUser}>Lưu thay đổi</Button>
            </>
          ) : (
            <Button variant="contained" color="primary" onClick={handleEdit}>Chỉnh sửa thông tin</Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileInfo;