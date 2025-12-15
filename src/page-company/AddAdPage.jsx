// src/page-company/AddAdPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// ĐÃ THAY ĐỔI: Import hàm mới để lấy địa điểm có thể quảng cáo
import { createAd, createPayment, getCompanyLocationsForAd, getAllCategories } from '../services/api'; 
import { FaMapMarkerAlt, FaStar, FaCheckCircle, FaHeart, FaShareAlt } from 'react-icons/fa';
import './AddLocationPage.css'; // Tái sử dụng CSS

// --- Dữ liệu cho các gói quảng cáo ---
const adPackages = [
    { id: 1, duration: 1, price: 1500000, monthlyPrice: 1500000, popular: false },
    { id: 2, duration: 3, price: 4000000, monthlyPrice: 1333333, popular: false },
    { id: 3, duration: 6, price: 7000000, monthlyPrice: 1166667, popular: true },
];

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN').format(Math.round(value));

export default function AddAdPage() {
    const navigate = useNavigate();

    // --- State cho form và UI ---
    const [formData, setFormData] = useState({
        title: '', description: '', locationId: '', categoryIds: [],
        actions: [],
    });
    const [selectedPackageId, setSelectedPackageId] = useState(adPackages.find(p => p.popular).id);
    const [companyLocations, setCompanyLocations] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const categoryDropdownRef = useRef(null);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // --- Lấy dữ liệu cho form ---
    useEffect(() => {
        const fetchDataForForm = async () => {
            setLoading(true);
            try {
                const [locationsRes, categoriesRes] = await Promise.all([
                    // ĐÃ THAY ĐỔI: Gọi API mới
                    getCompanyLocationsForAd(),
                    getAllCategories()
                ]);
                setCompanyLocations(locationsRes.data);
                setAllCategories(categoriesRes.data);
                if (locationsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, locationId: locationsRes.data[0].locationId }));
                }
            } catch (err) {
                setError("Không thể tải dữ liệu cho form. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        fetchDataForForm();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Các hàm xử lý sự kiện ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => {
            const currentCategoryIds = prev.categoryIds;
            if (currentCategoryIds.includes(categoryId)) {
                return { ...prev, categoryIds: currentCategoryIds.filter(id => id !== categoryId) };
            } else {
                return { ...prev, categoryIds: [...currentCategoryIds, categoryId] };
            }
        });
    };
    
    const handleActionChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            let currentActions = prev.actions;
            if (checked) {
                if (currentActions.length >= 2) return prev;
                currentActions = [...currentActions, value];
            } else {
                currentActions = currentActions.filter(action => action !== value);
            }
            return { ...prev, actions: currentActions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.locationId) {
            setError("Vui lòng chọn một địa điểm để quảng cáo.");
            return;
        }
        if (!user || !user.userId) {
            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const selectedPkg = adPackages.find(p => p.id === selectedPackageId);

        try {
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + selectedPkg.duration);
            
            const adData = {
                ...formData,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                budget: selectedPkg.price,
                createdById: user.userId,
            };

            const adResponse = await createAd(adData);
            const newAdId = adResponse.data.adId;
            
            const paymentResponse = await createPayment(selectedPkg.price, newAdId);
            
            if (paymentResponse.data.paymentUrl) {
                window.location.href = paymentResponse.data.paymentUrl;
            } else {
                setError("Không thể tạo URL thanh toán. Vui lòng liên hệ hỗ trợ.");
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi khi tạo quảng cáo.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const selectedLocation = useMemo(() => 
        companyLocations.find(loc => loc.locationId === Number(formData.locationId)),
        [companyLocations, formData.locationId]
    );

    const selectedPkg = adPackages.find(p => p.id === selectedPackageId);

    const filteredCategories = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
    const selectedCategories = allCategories.filter(cat => formData.categoryIds.includes(cat.categoryId));

    if (loading && companyLocations.length === 0) {
        return <div className="loading-state">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="add-location-page">
            <header className="page-header">
                <h1>Tạo chiến dịch quảng cáo mới</h1>
                <p>Tiếp cận hàng ngàn du khách tiềm năng bằng cách quảng bá địa điểm của bạn.</p>
            </header>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    {/* --- CỘT BÊN TRÁI --- */}
                    <div className="form-column">
                        <div className="form-card">
                            <h3 className="card-title">1. Chọn địa điểm và nội dung</h3>
                            <div className="form-group">
                                <label htmlFor="locationId">Chọn địa điểm cần quảng cáo</label>
                                <select id="locationId" name="locationId" value={formData.locationId} onChange={handleInputChange} required>
                                    {companyLocations.length === 0 ? (
                                        <option disabled value="">Bạn không có địa điểm nào để quảng cáo</option>
                                    ) : (
                                        companyLocations.map(loc => (
                                            <option key={loc.locationId} value={loc.locationId}>{loc.name}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="title">Tiêu đề / Slogan quảng cáo</label>
                                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: Mua 1 Tặng 1 Cà Phê Sữa" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Mô tả ngắn (dùng cho quản lý)</label>
                                <textarea id="description" name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Mô tả nội bộ về chiến dịch này..." required></textarea>
                            </div>
                        </div>

                        <div className="form-card">
                             <h3 className="card-title">2. Thiết lập chiến dịch</h3>
                             <div className="form-group">
                                 <label>Kêu gọi hành động (CTA) - Chọn tối đa 2</label>
                                 <div className="cta-checkbox-group">
                                     <label><input type="checkbox" name="actions" value="GUIDE" onChange={handleActionChange} checked={formData.actions.includes('GUIDE')} disabled={formData.actions.length >= 2 && !formData.actions.includes('GUIDE')} /> Chỉ đường</label>
                                     <label><input type="checkbox" name="actions" value="CALL" onChange={handleActionChange} checked={formData.actions.includes('CALL')} disabled={formData.actions.length >= 2 && !formData.actions.includes('CALL')} /> Gọi ngay</label>
                                     <label><input type="checkbox" name="actions" value="SAVE" onChange={handleActionChange} checked={formData.actions.includes('SAVE')} disabled={formData.actions.length >= 2 && !formData.actions.includes('SAVE')} /> Lưu yêu thích</label>
                                     <label><input type="checkbox" name="actions" value="SHARE" onChange={handleActionChange} checked={formData.actions.includes('SHARE')} disabled={formData.actions.length >= 2 && !formData.actions.includes('SHARE')} /> Chia sẻ</label>
                                 </div>
                             </div>
                            <div className="form-group">
                                <label>Chọn từ khóa tìm kiếm</label>
                                <div className="multi-select-container" ref={categoryDropdownRef}>
                                    <div className="multi-select-input" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
                                        <span className="multi-select-placeholder">
                                            {selectedCategories.length > 0 ? `${selectedCategories.length} từ khóa đã chọn` : "Chọn từ khóa"}
                                        </span>
                                        <span>▼</span>
                                    </div>
                                    {isCategoryDropdownOpen && (
                                        <div className="multi-select-dropdown">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm từ khóa..."
                                                className="multi-select-search"
                                                value={categorySearchTerm}
                                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                            />
                                            <ul className="multi-select-list">
                                                {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                                                    <li key={cat.categoryId} className="multi-select-item" onClick={() => handleCategoryChange(cat.categoryId)}>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.categoryIds.includes(cat.categoryId)}
                                                            readOnly
                                                        />
                                                        <label>{cat.name}</label>
                                                    </li>
                                                )) : <li className="multi-select-item-not-found">Không tìm thấy từ khóa</li>}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="selected-pills-container">
                                    {selectedCategories.map(cat => (
                                        <div key={cat.categoryId} className="selected-pill">
                                            {cat.name}
                                            <button
                                                type="button"
                                                className="selected-pill-remove"
                                                onClick={() => handleCategoryChange(cat.categoryId)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <small>Nhấp vào ô trên để chọn từ khóa.</small>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT BÊN PHẢI --- */}
                    <div className="form-column">
                        <div className="form-card">
                            <h3 className="card-title">Xem trước quảng cáo</h3>
                            <div className="ad-preview-card blue-theme">
                                <span className="ad-preview-tag">Quảng cáo</span>
                                <div className="ad-preview-content">
                                    <div className="ad-preview-image">
                                        {selectedLocation?.images?.length > 0 ? <img src={selectedLocation.images[0]} alt="Ảnh địa điểm" /> : <span>Ảnh QC</span>}
                                    </div>
                                    <div className="ad-preview-info">
                                        <h4 className="ad-preview-location-name">{selectedLocation?.name || "Tên địa điểm"}</h4>
                                        <p className="ad-preview-title">"{formData.title || "Slogan quảng cáo"}"</p>
                                        <div className="ad-preview-details">
                                            <span><FaStar style={{ color: '#f59e0b' }} /> {selectedLocation?.averageRating?.toFixed(1) || '4.8'} ({selectedLocation?.reviewCount || '1.2k'} đánh giá)</span>
                                            <span><FaMapMarkerAlt /> {selectedLocation?.location || "Địa chỉ"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ad-preview-actions">
                                    {formData.actions.includes('GUIDE') && <button type="button" className="ad-preview-btn primary">Chỉ đường</button>}
                                    {formData.actions.includes('CALL') && <button type="button" className="ad-preview-btn secondary">Gọi ngay</button>}
                                    {formData.actions.includes('SAVE') && <button type="button" className="ad-preview-btn secondary"><FaHeart /> Lưu</button>}
                                    {formData.actions.includes('SHARE') && <button type="button" className="ad-preview-btn secondary"><FaShareAlt /> Chia sẻ</button>}
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <h3 className="card-title">3. Chọn gói và thanh toán</h3>
                            <div className="package-selection">
                                {adPackages.map(pkg => {
                                    const saved = 1 - (pkg.monthlyPrice / adPackages[0].monthlyPrice);
                                    return (
                                        <div key={pkg.id} className={`package-card ${selectedPackageId === pkg.id ? 'selected' : ''} ${pkg.popular ? 'popular' : ''}`} onClick={() => setSelectedPackageId(pkg.id)}>
                                            {pkg.popular && <span className="popular-badge">Tiết kiệm nhất</span>}
                                            <div className="package-duration">{pkg.duration} tháng</div>
                                            <div className="package-price">{formatCurrency(pkg.price)} VNĐ</div>
                                            <div className="package-monthly">Chỉ {formatCurrency(pkg.monthlyPrice)}/tháng</div>
                                            {saved > 0 && <div className="package-saved">Tiết kiệm {Math.round(saved * 100)}%</div>}
                                            <div className="radio-selector">
                                                {selectedPackageId === pkg.id && <FaCheckCircle />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{fontWeight: '600', fontSize: '1.1rem'}}>Tổng cộng</span>
                                    <strong style={{ color: '#2563eb', fontSize: '1.5rem' }}>
                                        {formatCurrency(selectedPkg?.price || 0)} VNĐ
                                    </strong>
                                </div>
                            </div>
                             {error && <div className="error-message">{error}</div>}
                            <div className="form-actions" style={{padding: '0', marginTop: '1.5rem'}}>
                                <button type="submit" className="btn btn-primary" disabled={loading || companyLocations.length === 0} style={{width: '100%'}}>
                                    {loading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}