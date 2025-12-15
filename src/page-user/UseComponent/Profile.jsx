import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery
} from "@mui/material";
import ProfileInfo from "./ProfileInfo";
import FavoritesTab from "./FavoritesTab";
import HistoryTab from "./HistoryTab";
import SettingsTab from "./SettingsTab";
import {
  getCurrentUser,
  updateUserProfile,
  getFavorites,
  updateAvatar,
  toggleFavorite,
  getAverageRating,
  getLocationDetail
} from "../../services/api";

export const Header = ({ title }) => {
  return (
    <Box sx={{ pb: 3, background: "white", padding: "30px", marginBottom: "40px", borderRadius: "20px" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
    </Box>
  );
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState({});
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("searchHistory")) || []);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => JSON.parse(localStorage.getItem("notificationsEnabled")) ?? true
  );
  const [gpsEnabled, setGpsEnabled] = useState(() => JSON.parse(localStorage.getItem("gpsEnabled")) ?? true);
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "vi");
  const navigate = useNavigate();
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(location.state?.userLocation || null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [tab, setTab] = useState(location.state?.initialTab || 0);
  const isMobile = useMediaQuery("(max-width:600px)");
  const fetchAndRefreshFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const favoritesRes = await getFavorites();
      const favoriteRefsRaw = favoritesRes.data || [];
      const validFavoriteRefs = favoriteRefsRaw.filter(fav => fav && fav.locationId !== undefined && fav.locationId !== null);

      if (validFavoriteRefs.length > 0) {
        const detailPromises = validFavoriteRefs.map(fav => getLocationDetail(fav.locationId));
        const ratingPromises = validFavoriteRefs.map(fav => getAverageRating(fav.locationId));
        const detailResults = await Promise.allSettled(detailPromises);
        const ratingResults = await Promise.allSettled(ratingPromises);
        const favoritesWithDetails = [];
        const newRatings = {};

        detailResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.data) {
            const detailData = result.value.data;
            favoritesWithDetails.push(detailData);

            const ratingResult = ratingResults[index];
            if (ratingResult.status === 'fulfilled') {
              newRatings[detailData.locationId] = ratingResult.value.data || 0;
            } else {
              newRatings[detailData.locationId] = 0;
            }
          } else {
            console.error(`Không thể lấy chi tiết cho locationId ${validFavoriteRefs[index]?.locationId}:`, result.reason);
          }
        });

        setFavorites(favoritesWithDetails);
        setRatings(newRatings);
      } else {
        setFavorites([]);
        setRatings({});
      }
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi tải danh sách yêu thích:", error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const profileData = await getCurrentUser();

        const formattedUser = {
          accountId: profileData.accountId,
          username: profileData.username,
          email: profileData.email,
          fullName: profileData.fullName,
          // Sửa lỗi: Lấy từ phoneNumber của API và lưu vào phone của state
          phone: profileData.phoneNumber,
          address: profileData.address,
          avatar: profileData.avatar || "https://res.cloudinary.com/dduv5y00x/image/upload/v1725091761/image_default_profile.jpg",
          budget: profileData.budget,
          travelStyles: profileData.travelStyles,
          interests: profileData.interests,
          companions: profileData.companions
        };

        setUser(formattedUser);

        await fetchAndRefreshFavorites();

      } catch (e) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", e.message);
      }
    };

    fetchInitialData();
  }, [fetchAndRefreshFavorites]);

  useEffect(() => {
    if (!userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Không lấy được vị trí user")
      );
    }
  }, [userLocation]);

  useEffect(() => {
    localStorage.setItem("profileTab", tab);
  }, [tab]);

  const handleRoute = (placeName) => {
    navigate("/user/dashboard", { state: { destination: placeName } });
  };

  const handleRemoveFavorite = async (locationId) => {
    try {
      await toggleFavorite(locationId);
      await fetchAndRefreshFavorites();
    } catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
      alert("Xóa không thành công, vui lòng thử lại.");
    }
  };


  const handleRemoveHistory = (index) => {
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleSaveSettings = useCallback(() => {
    localStorage.setItem("notificationsEnabled", JSON.stringify(notificationsEnabled));
    localStorage.setItem("language", language);
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Cài đặt đã được lưu.',
      timer: 1500,
      showConfirmButton: false,
    });
  }, [notificationsEnabled, language]);
  const handleSaveUser = async () => {
    try {
      if (tempUser?.avatarFile) {
        await updateAvatar(user.accountId, tempUser.avatarFile);
      }

      // Sửa lỗi: Lấy phone từ tempUser và chuyển thành phoneNumber để gửi lên API
      const { phone, ...restOfProfileData } = tempUser;
      const dataToSend = { ...restOfProfileData, phoneNumber: phone };

      await updateUserProfile(user.accountId, dataToSend);

      const profileDataRes = await getCurrentUser();

      const updatedFormattedUser = {
        accountId: profileDataRes.accountId,
        username: profileDataRes.username,
        email: profileDataRes.email,
        fullName: profileDataRes.fullName,
        // Sửa lỗi: Lấy từ phoneNumber của API sau khi cập nhật
        phone: profileDataRes.phoneNumber,
        address: profileDataRes.address,
        avatar: profileDataRes.avatar || user.avatar,
        budget: profileDataRes.budget,
        travelStyles: profileDataRes.travelStyles,
        interests: profileDataRes.interests,
        companions: profileDataRes.companions
      };

      setUser(updatedFormattedUser);

      setIsEditing(false);
      setPreviewAvatar(null);
    } catch (e) {
      console.error("Lỗi cập nhật hồ sơ:", e.message);
    }
  };

  const handleEdit = () => {
    setTempUser(user);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempUser(null);
    setPreviewAvatar(null);
  };

  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return (
          <ProfileInfo
            user={user} isEditing={isEditing} tempUser={tempUser}
            previewAvatar={previewAvatar} setTempUser={setTempUser}
            handleEdit={handleEdit} handleCancelEdit={handleCancelEdit}
            handleSaveUser={handleSaveUser} setPreviewAvatar={setPreviewAvatar}
          />
        );
      case 1:
        return (
          <FavoritesTab
            favorites={favorites}
            ratings={ratings}
            handleRemoveFavorite={handleRemoveFavorite}
            isLoading={isLoading}
            userLocation={userLocation}
          />
        );
      case 2:
        return (
          <HistoryTab
            history={history} handleRemoveHistory={handleRemoveHistory}
            handleClearAllHistory={handleClearAllHistory} handleRoute={handleRoute}
          />
        );
      case 3:
        return (
          <SettingsTab
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            gpsEnabled={gpsEnabled} 
            setGpsEnabled={setGpsEnabled} 
            language={language}
            setLanguage={setLanguage}
            handleSaveSettings={handleSaveSettings}
            userRole="user"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100vh",
        background: "#f8f9fa"
      }}
    >
      {/* Sidebar Tabs */}
      <Box
        sx={{
          width: { md: 250, xs: "100%" },
          background: "#fff",
          borderRight: { md: 1, xs: 0 },
          borderBottom: { xs: 1, md: 0 },
          borderColor: "divider",
          display: "flex",
          flexDirection: { md: "column", xs: "row" },
          position: "relative"
        }}
      >
        {isMobile && (
          <Button
            variant="contained"
            onClick={() => navigate("/user/dashboard")}
            sx={{
              position: "absolute",
              top: 60,
              right: 10,
              minWidth: 0,
              width: 30,
              height: 30,
              borderRadius: "50%",
              padding: 0,
              fontSize: "1rem",
              zIndex: 1000,
              backgroundColor: "#656cd2ff",
              color: "#fff",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "#1565c0"
              }
            }}
          >
            ←
          </Button>
        )}
        <Tabs
          orientation={isMobile ? "horizontal" : "vertical"}
          variant="scrollable"
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          sx={{
            flexGrow: 1,
            ml: { md: "30px" }, // dịch sang phải trên PC
            mt: { md: "30px" }, // dịch xuống trên PC
            ".MuiTab-root": {
              py: { md: "15px" }, // khoảng cách giữa các tab trên PC
              fontSize: { md: "1.2rem" }, // tăng 4px trên PC
              fontWeight: { md: "bold" }, // in đậm trên PC
              justifyContent: "flex-start",
              textAlign: "left",
              alignItems: { md: "flex-start", xs: "center" },
              flexDirection: { md: "row", xs: "column" }
            }
          }}
        >
          <Tab label="Thông tin" />
          <Tab label="Yêu thích" />
          <Tab label="Lịch sử" />
          <Tab label="Cài đặt" />
        </Tabs>
        {!isMobile && (
          <Button
            variant="outlined"
            sx={{
              position: "absolute",
              bottom: 13,
              left: 14,
              textTransform: "none",
              fontSize: "0.875rem"
            }}
            onClick={() => navigate("/user/dashboard")}
          >
            ← Quay lại trang chính
          </Button>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1, md: 3 } }}>
        {isLoading || !user ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%"
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          renderTabContent()
        )}
      </Box>
    </Box>
  );
};

export default Profile;