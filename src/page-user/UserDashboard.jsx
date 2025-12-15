// src/page-user/UserDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import MapView from '../components/map/MapView';
import SearchBox from '../components/map/SearchBox';
import Select from "react-select";
import Swal from 'sweetalert2'; // Import Swal
import {
    getAllLocations,
    getRecommendations,
    getCurrentUser,
    getAds,
    getAverageRating,
    getCategories,
    toggleFavorite,
    getFavorites,
    searchLocations
} from '../services/api';
import './UserDashboard.css';

import AdCard from "./UseComponent/AdCard";
import AiRecommendationsTab from "./UseComponent/AiRecommendationsTab";

// --- Helper Functions ---
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    if ([lat1, lon1, lat2, lon2].some(coord => typeof coord !== 'number')) {
        return null;
    }
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const toSlug = (text) => {
    if (!text) return "";
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-");
};

const FALLBACK_IMAGE_URL = "https://placehold.co/600x400/e2e8f0/64748b?text=TravelSpotter";
const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/dduv5y00x/image/upload/v1725091761/image_default_profile.jpg";

// --- Main Component ---
export default function UserDashboard({ onLogout }) {
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("");
    const [ratingsFilter, setRatingsFilter] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('suggestions');

    // --- State for API data ---
    const [allSuggestions, setAllSuggestions] = useState([]);
    const [suggestionsWithDistance, setSuggestionsWithDistance] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);
    const [recommendedPlaces, setRecommendedPlaces] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [user, setUser] = useState(null);
    const [ads, setAds] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ratings, setRatings] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem("searchHistory")) || []);

    const [favorites, setFavorites] = useState([]);

    const [areaFilter, setAreaFilter] = useState("");
    const [areas, setAreas] = useState([]);
    const toggleUserMenu = () => setShowUserMenu(prev => !prev);
    const [aiRecommendationsLoaded, setAiRecommendationsLoaded] = useState(false);
    const handleLogoutClick = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Bạn chắc chắn muốn đăng xuất?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                onLogout(); // Gọi hàm onLogout nếu người dùng đồng ý
            }
        });
    };
    const handleCloseRoute = () => {
        setStart(null);
        setEnd(null);
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                setUser(storedUser);
            }

            const results = await Promise.allSettled([
                getCurrentUser(),
                getCategories(),
                getAds(),
                getFavorites()
            ]);

            const [userProfileRes, categoriesRes, adsRes, favoritesRes] = results;

            if (userProfileRes.status === 'fulfilled') {
                const fullUserProfile = userProfileRes.value.data || userProfileRes.value;
                setUser(currentUser => ({
                    ...currentUser,
                    ...fullUserProfile,
                    avatar: fullUserProfile.avatar || DEFAULT_AVATAR_URL
                }));

                if (storedUser) {
                    storedUser.avatar = fullUserProfile.avatar || DEFAULT_AVATAR_URL;
                    storedUser.username = fullUserProfile.username;
                    localStorage.setItem("user", JSON.stringify(storedUser));
                }
            } else {
                console.error("Lỗi khi tải thông tin người dùng:", userProfileRes.reason);
            }

            if (categoriesRes.status === 'fulfilled') {
                setCategories(categoriesRes.value.data || []);
            } else {
                console.error("Lỗi khi tải danh mục:", categoriesRes.reason);
                setCategories([]);
            }

            if (adsRes.status === 'fulfilled') {
                const activeAds = (adsRes.value.data || [])
                    .filter(ad => ad.status === 'ACTIVE')
                    .map(ad => ({ ...ad, isAd: true }));
                setAds(activeAds);
            } else {
                console.error("Lỗi khi tải quảng cáo:", adsRes.reason);
                setAds([]);
            }

            if (favoritesRes.status === 'fulfilled') {
                setFavorites(favoritesRes.value.data || []);
            } else {
                console.error("Lỗi khi tải danh sách yêu thích:", favoritesRes.reason);
                setFavorites([]);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchLocationsAndUserLocation = async () => {
            setIsLoading(true);
            try {
                const locationsRes = await getAllLocations();
                const activeLocations = locationsRes?.data?.filter(loc => loc.status === 'ACTIVE') || [];
                setAllSuggestions(activeLocations);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu địa điểm:", error);
            } finally {
                setLoadingSuggestions(false);
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${userLoc.lat}&lon=${userLoc.lng}`)
                            .then(res => {
                                // Lấy địa chỉ chi tiết từ API (ví dụ: Nominatim)
                                const fullAddress = res.data.display_name || "Vị trí hiện tại";
                                setUserLocation({ ...userLoc, fullAddress: fullAddress }); // Lưu địa chỉ chi tiết vào userLocation
                            })
                            .catch(error => {
                                console.error("Lỗi reverse geocoding:", error);
                                setUserLocation(userLoc); // Vẫn lưu tọa độ nếu lỗi
                            });
                    },
                    (err) => {
                        console.error("Lỗi khi lấy vị trí (geolocation):", err);
                        Swal.fire({
                            icon: 'warning',
                            title: 'Chưa bật GPS',
                            text: 'Vui lòng bật GPS để sử dụng đầy đủ tính năng của ứng dụng.',
                            confirmButtonText: 'Đã hiểu'
                        });
                    }
                );
            } else {
                console.error("Trình duyệt không hỗ trợ Geolocation.");
            }
            setIsLoading(false);
        };
        fetchLocationsAndUserLocation();
    }, []);

    const fetchInitialRecommendations = useCallback(async (currentLocation) => {
        if (!user || !currentLocation) return;
        setLoadingRecommendations(true);
        try {
            const userProfileRes = await getCurrentUser();
            const userProfile = userProfileRes.data || userProfileRes;
            if (!userProfile) throw new Error("Không lấy được thông tin hồ sơ người dùng.");

            const userUpdatePayload = {
                travelStyles: userProfile.travelStyles || [],
                interests: userProfile.interests || [],
                budget: userProfile.budget || "Không rõ",
                companions: userProfile.companions || [],
            };
            const payload = {
                accountId: user.userId,
                location: currentLocation,
                userUpdate: userUpdatePayload,
            };
            const recRes = await getRecommendations(payload);
            setRecommendedPlaces(recRes?.data?.places || []);
        } catch (recError) {
            console.error("Lỗi khi lấy đề xuất AI ban đầu:", recError);
        } finally {
            setLoadingRecommendations(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'ai' && userLocation && !aiRecommendationsLoaded) {
            fetchInitialRecommendations(userLocation);
            setAiRecommendationsLoaded(true);
        }
    }, [activeTab, userLocation, fetchInitialRecommendations, aiRecommendationsLoaded]);

    const handleAiSearch = useCallback(async (query) => {
        if (!query || !user) return;
        setLoadingRecommendations(true);
        try {
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
            const geocodeRes = await axios.get(geocodeUrl);
            if (!geocodeRes.data || geocodeRes.data.length === 0) {
                throw new Error("Không thể tìm thấy tọa độ cho địa điểm bạn đã nhập.");
            }
            const { lat, lon } = geocodeRes.data[0];
            const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) };
            await fetchInitialRecommendations(newLocation);
        } catch (err) {
            console.error("Lỗi khi lấy đề xuất AI theo địa điểm:", err);
            Swal.fire({
                icon: 'error',
                title: 'Tìm kiếm thất bại',
                text: err.message,
            });
            setLoadingRecommendations(false);
        }
    }, [user, fetchInitialRecommendations]);


    useEffect(() => {
        if (!userLocation || allSuggestions.length === 0) return;
        const updated = allSuggestions.map(s => ({
            ...s,
            distance: haversineDistance(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
        }));
        setSuggestionsWithDistance(updated);
        updated.forEach(s => {
            fetchAverageRating(s.locationId);
        });
    }, [userLocation, allSuggestions]);

    useEffect(() => {
        if (location.state?.routeFromDetail) {
            const { start, end } = location.state.routeFromDetail;
            setStart(start);
            setEnd(end);
            navigate(location.pathname, { replace: true, state: {} });
            return;
        }
        const historyPlace = location.state?.routeFromHistory;
        if (historyPlace && userLocation && historyPlace.lat && historyPlace.lng) {
            const startCoord = {
                lat: userLocation.lat,
                lng: userLocation.lng,
                fullAddress: userLocation.fullAddress || "Vị trí hiện tại"
            };
            const endCoord = {
                lat: historyPlace.lat,
                lng: historyPlace.lng,
                fullAddress: historyPlace.address
            };
            setStart(startCoord);
            setEnd(endCoord);
            navigate(location.pathname, { replace: true, state: {} }); 
            return;
        }
        
    }, [location.state, navigate, userLocation]);

    const fetchAverageRating = async (placeId) => {
        try {
            const response = await getAverageRating(placeId);
            const avg = response.data;
            if (typeof avg === 'number' && !isNaN(avg)) {
                setRatings(prev => ({ ...prev, [placeId]: Number(avg.toFixed(1)) }));
            } else {
                setRatings(prev => ({ ...prev, [placeId]: 0 }));
            }
        } catch (e) {
            console.error(`Không lấy được rating cho địa điểm ${placeId}:`, e.message);
            setRatings(prev => ({ ...prev, [placeId]: 0 }));
        }
    };
    const handleSearchByName = useCallback(async (adObject) => {
        if (isLoading) {
            Swal.fire({
                title: 'Vui lòng chờ',
                text: 'Đang tải dữ liệu, vui lòng chờ...',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        try {
            setIsLoading(true);
            const query = adObject.locationAddress || adObject.locationName;
            const data = await searchLocations(query);

            if (!data.data || data.data.length === 0) {
                throw new Error("Không tìm thấy địa điểm.");
            }
            const normalizedQuery = query.toLowerCase().trim();
            const matchedPlace = data.data.find(p =>
                p.name?.toLowerCase().includes(adObject.locationName.toLowerCase()) ||
                p.location?.toLowerCase().includes(normalizedQuery)
            ) || data.data[0];

            const endCoord = {
                lat: matchedPlace.latitude,
                lng: matchedPlace.longitude,
                fullAddress: matchedPlace.name
                    ? `${matchedPlace.name} - ${matchedPlace.location}`
                    : matchedPlace.location,
            };
            setSearchHistory(prev => {
                const newHistoryItem = {
                    name: adObject.locationName, 
                    address: endCoord.fullAddress,
                    lat: endCoord.lat, 
                    lng: endCoord.lng 
                };
                const filteredHistory = prev.filter(item => 
                    item.lat !== newHistoryItem.lat || item.lng !== newHistoryItem.lng
                );
                const updated = [newHistoryItem, ...filteredHistory].slice(0, 10);
                localStorage.setItem("searchHistory", JSON.stringify(updated));
                return updated;
            });

            setStart({
                lat: userLocation?.lat ?? 0,
                lng: userLocation?.lng ?? 0,
                fullAddress: userLocation?.fullAddress || "Vị trí hiện tại"
            });
            setEnd(endCoord);

        } catch (error) {
            Swal.fire({
                title: 'Tìm kiếm thất bại',
                text: error.message,
                icon: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, userLocation]);

    useEffect(() => {
        const hanoiDistricts = [
            "Quận Ba Đình", "Quận Cầu Giấy", "Quận Đống Đa", "Quận Hai Bà Trưng",
            "Quận Hoàn Kiếm", "Quận Thanh Xuân", "Quận Hoàng Mai", "Quận Long Biên",
            "Quận Hà Đông", "Quận Tây Hồ", "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm"
        ];
        setAreas(hanoiDistricts);
    }, []);



    const handleRouteToLocation = async (item) => {
        try {
            if (!item.lat || !item.lng) {
                console.error("Dữ liệu AI trả về không có tọa độ lat/lng:", item);
                throw new Error("Dữ liệu đề xuất không hợp lệ, thiếu tọa độ.");
            }

            // Nếu chưa có GPS thì cảnh báo nhưng vẫn đặt vị trí mặc định
            if (!userLocation || !userLocation.lat) {
                await Swal.fire({
                    title: "Chưa có vị trí",
                    text: "Không xác định được vị trí hiện tại. Sẽ dùng 'Vị trí hiện tại' mặc định.",
                    icon: "warning"
                });
            }

            const startCoord =
                userLocation && userLocation.lat
                    ? { lat: userLocation.lat, lng: userLocation.lng, fullAddress: userLocation.fullAddress || "Vị trí hiện tại" } // <<< SỬA Ở ĐÂY
                    : { lat: 0, lng: 0, fullAddress: "Vị trí hiện tại" };

            const endCoord = {
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lng),
                fullAddress: item.location,
            };

            setStart(startCoord);
            setEnd(endCoord);
        } catch (error) {
            console.error("Lỗi khi chỉ đường đến địa điểm:", error);
            Swal.fire({
                title: "Lỗi chỉ đường",
                text: error.message,
                icon: "error",
            });
        }
    };

    const handleToggleFavorite = async (place) => {
        try {
            await toggleFavorite(place.locationId);
            const updatedFavoritesRes = await getFavorites();
            setFavorites(updatedFavoritesRes.data || []);
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
            Swal.fire({
                title: 'Thao tác thất bại',
                text: 'Không thể cập nhật trạng thái yêu thích, vui lòng thử lại.',
                icon: 'error'
            });
        }
    };

    const filteredSuggestions = suggestionsWithDistance.filter(s => {
        const avgRating = ratings[s.locationId];
        const cleanAreaFilter = areaFilter ? areaFilter.replace(/^(Quận|Huyện)\s/i, "").toLowerCase() : "";
        return (
            (!category || (s.categoryNames && s.categoryNames.includes(category))) &&
            (!query || s.name.toLowerCase().includes(query.toLowerCase())) &&
            (!ratingsFilter || (avgRating !== undefined && avgRating >= parseFloat(ratingsFilter))) &&
            (!areaFilter || (s.location && s.location.toLowerCase().includes(cleanAreaFilter)))
        );
    });

    const visibleSuggestions = useMemo(() => {
        const merged = [...ads, ...filteredSuggestions];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return merged.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSuggestions, ads, currentPage, itemsPerPage]);

    const totalPages = Math.ceil((filteredSuggestions.length + ads.length) / itemsPerPage);

    return (
        <div className="map-body">
            <div className="map-header">
                <div className="logo">TravelSuggest</div>
                <SearchBox
                    onSearch={(s, e) => { setStart(s); setEnd(e); }}
                    setStart={setStart}
                    query={query}
                    setQuery={setQuery}
                />
                <div className="user-section">
                    <img
                        src={user?.avatar || DEFAULT_AVATAR_URL}
                        alt="User Avatar"
                        className="user-avatar-icon"
                        onClick={toggleUserMenu}
                    />
                    {showUserMenu && (
                        <div className="user-menu">
                            <div className="user-name">{user?.username || "Khách"}</div>
                            <button className="profile-btn" onClick={() => navigate("/profile")}>Hồ sơ cá nhân</button>
                            <button className="logout-btn" onClick={handleLogoutClick}>Đăng xuất</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="map-layout">
                <div className="map-left">
                    <div className="map-view">
                        <MapView start={start} end={end} recommendedPlaces={recommendedPlaces} onClose={handleCloseRoute} />
                    </div>
                </div>
                <div className="map-right">
                    <div className="suggestions-header">
                        <div className="tabs-container">
                            <button className={`tab-button ${activeTab === 'suggestions' ? 'active' : ''}`} onClick={() => setActiveTab('suggestions')}>
                                Gợi ý địa điểm
                            </button>
                            <button className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => { setActiveTab('ai'); setAiRecommendationsLoaded(false); }}>
                                Đề xuất bởi AI
                            </button>
                        </div>
                        {activeTab === 'suggestions' && (
                            <>
                                <div className="filter-row">
                                    <select onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Tất cả danh mục</option>
                                        {Array.isArray(categories) && categories.map(c => (
                                            <option key={c.categoryId} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    <select onChange={(e) => setRatingsFilter(e.target.value)}>
                                        <option value="">Đánh giá</option>
                                        <option value="3">3 ⭐ trở lên</option>
                                        <option value="4">4 ⭐ trở lên</option>
                                    </select>
                                    <Select styles={{ borderRadius: "12px", }}
                                        options={areas.map(a => ({ value: a, label: a }))}
                                        onChange={(opt) => setAreaFilter(opt ? opt.value : "")}
                                        isClearable
                                        placeholder="quận/huyện..."
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="sidebar-content-scroll">
                        {activeTab === 'suggestions' ? (
                            <>
                                <div className="suggestions-grid">
                                    {loadingSuggestions ? (
                                        <p>Đang tải gợi ý...</p>
                                    ) : visibleSuggestions.length > 0 ? (
                                        visibleSuggestions.map(item => (
                                            item.isAd ? (
                                                <AdCard key={`ad-${item.adId}`} ad={item} onRoute={(adObject) => handleSearchByName(adObject)} onCall={(name) => alert(`Chức năng gọi điện cho ${name} đang phát triển.`)} onNavigate={navigate} userLocation={userLocation} />
                                            ) : (
                                                <div key={item.locationId} className="suggestion-card-v2" onClick={() => { const slug = toSlug(item.name); navigate(`/location/${item.locationId}/${slug}`, { state: { userLocation } }); }}>
                                                    <div className="card-image-container">
                                                        <img src={item.images?.[0] || FALLBACK_IMAGE_URL} alt={item.name} />
                                                        <div className="card-badge">{item.categoryNames?.join(', ') || 'N/A'}</div>
                                                        <button
                                                            className={`card-favorite-btn ${favorites.some(f => f.locationId === item.locationId) ? "active" : ""}`}
                                                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item); }}
                                                        >
                                                            {favorites.some(f => f.locationId === item.locationId) ? "❤️" : "♡"}
                                                        </button>
                                                    </div>
                                                    <div className="card-content">
                                                        <h4 className="card-title">{item.name}</h4>
                                                        <div className="card-rating">
                                                            <FaStar className="star-icon" />
                                                            <span>{ratings[item.locationId] ? ratings[item.locationId].toFixed(1) : 'Chưa có'}</span>
                                                        </div>
                                                        <p className="card-address">{item.location}</p>
                                                    </div>
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <p>Không tìm thấy gợi ý phù hợp.</p>
                                    )}
                                </div>

                            </>
                        ) : (
                            <AiRecommendationsTab recommendations={recommendedPlaces} isLoading={loadingRecommendations} userLocation={userLocation} onSearch={handleAiSearch} onNavigateToRoute={handleRouteToLocation} />
                        )}
                    </div>
                    <div className="pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>◀</button>
                        <span>Trang {currentPage}</span>
                        <button disabled={visibleSuggestions.length < itemsPerPage || totalPages === currentPage} onClick={() => setCurrentPage(p => p + 1)}>▶</button>
                    </div>
                </div>
            </div>
            <div className="map-footer">
                <div onClick={() => navigate("/profile", { state: { initialTab: 1 } })}>❤️ Yêu thích</div>
                <div onClick={() => navigate("/support")}>⚙️ Hỗ trợ</div>
                <button className="sidebar-btn" onClick={() => navigate("/profile")}>Xem Hồ sơ</button>
            </div>
        </div>
    );
}