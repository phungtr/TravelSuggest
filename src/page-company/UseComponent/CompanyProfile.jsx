
// src/page-company/UseComponent/CompanyProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Paper // Thêm Paper để tạo nền trắng đẹp hơn
} from "@mui/material";
import CompanyProfileInfo from "./CompanyProfileInfo.jsx";
import SettingsTab from "../../page-user/UseComponent/SettingsTab";
// Bỏ import Header vì CompanyLayout đã có tiêu đề
import { updateCompanyProfile, updateAvatar, getCurrentCompany } from "../../services/api";

const CompanyProfile = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const fetchProfile = async () => {
    try {
      const profileData = await getCurrentCompany();
      setUser(profileData);
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu công ty:", e.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setTempUser(user);
    setIsEditing(true);
    setPreviewAvatar(user?.avatar);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempUser(null);
    setPreviewAvatar(null);
  };

  const handleSaveUser = async () => {
    try {
      if (tempUser?.avatarFile) {
        await updateAvatar(user.accountId, tempUser.avatarFile);
      }
      
      const { avatarFile, ...profileData } = tempUser;
      await updateCompanyProfile(user.accountId, profileData);

      await fetchProfile();
      setIsEditing(false);
      setPreviewAvatar(null);
      alert("Cập nhật hồ sơ thành công!");
    } catch (e) {
      console.error("Lỗi cập nhật hồ sơ:", e);
      alert("Cập nhật thất bại: " + (e.response?.data?.message || e.message));
    }
  };

  const renderTabContent = () => {
    // Không cần Header ở đây nữa
    switch (tab) {
      case 0:
        return (
          <CompanyProfileInfo
            user={user}
            isEditing={isEditing}
            tempUser={tempUser}
            previewAvatar={previewAvatar}
            setTempUser={setTempUser}
            handleEdit={handleEdit}
            handleCancelEdit={handleCancelEdit}
            handleSaveUser={handleSaveUser}
            setPreviewAvatar={setPreviewAvatar}
          />
        );
      case 1:
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    // Sử dụng Paper để tạo nền trắng và bo góc cho toàn bộ khu vực profile
    <Paper sx={{ display: "flex", height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <Tabs
        orientation="vertical"
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{
          borderRight: 1, borderColor: "divider",
          minWidth: 220,
          position: 'relative' // Để định vị nút Quay lại
        }}
      >
        <Tab label="Thông tin" sx={{ alignItems: 'flex-start', p: '12px 24px', textTransform: 'none', fontSize: '1rem' }} />
        <Tab label="Cài đặt" sx={{ alignItems: 'flex-start', p: '12px 24px', textTransform: 'none', fontSize: '1rem' }} />
        <Button
          variant="outlined"
          sx={{ 
            position: "absolute", 
            bottom: 16, 
            left: 16, 
            right: 16,
            textTransform: 'none' 
          }}
          onClick={() => navigate("/company/dashboard")}
        >
          ← Quay lại
        </Button>
      </Tabs>
      
      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        {!user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          renderTabContent()
        )}
      </Box>
    </Paper>
  );
};

export default CompanyProfile;