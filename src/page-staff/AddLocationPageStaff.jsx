// src/page-staff/AddLocationPageStaff.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { FaUpload, FaTrash } from 'react-icons/fa';
import { createLocationByStaff, getAllCategories } from '../services/api';
import '../page-company/AddLocationPage.css';

// --- (Các phần khác giữ nguyên) ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const MapController = ({ position, setPosition, setAddress }) => {
    const map = useMap();
    useEffect(() => { if (position) map.flyTo(position, 16); }, [position, map]);
    const markerRef = useRef(null);
    useMapEvents({ click(e) { setPosition(e.latlng); }, });
    useEffect(() => {
        const fetchAddress = async () => {
            if (!position) return;
            try {
                const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
                if (response.data.display_name) setAddress(response.data.display_name);
            } catch (error) { console.error("Lỗi khi lấy địa chỉ:", error); }
        };
        fetchAddress();
    }, [position, setAddress]);
    const eventHandlers = { dragend() { const marker = markerRef.current; if (marker != null) setPosition(marker.getLatLng()); }, };
    return <Marker position={position} draggable={true} eventHandlers={eventHandlers} ref={markerRef} />;
};

// --- Component chính ---
export default function AddLocationPageStaff() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', description: '', location: '', price: '',
        openTime: '08:00', closeTime: '22:00', website: '', phoneNumber: '',
        categoryIds: [],
    });
    
    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [position, setPosition] = useState({ lat: 21.028511, lng: 105.804817 });
    const [loading, setLoading] = useState(false);
    const [mapSearchLoading, setMapSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const categoryDropdownRef = useRef(null);

    const [user] = useState(() => JSON.parse(localStorage.getItem("user") || null));

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getAllCategories();
                setCategories(response.data);
            } catch (err) { setError("Không thể tải danh sách danh mục."); }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => { if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setIsCategoryDropdownOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const setAddressFromMap = useCallback((address) => {
        setFormData(prev => ({ ...prev, location: address }));
    }, []);

    const handleAddressSearch = useCallback(async (address) => {
        if (!address) return;
        setMapSearchLoading(true);
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            if (response.data?.[0]) {
                const { lat, lon } = response.data[0];
                setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
            }
        } catch (err) { console.error("Lỗi Geocoding:", err); } 
        finally { setMapSearchLoading(false); }
    }, []);

    useEffect(() => {
        const identifier = setTimeout(() => handleAddressSearch(formData.location), 1000);
        return () => clearTimeout(identifier);
    }, [formData.location, handleAddressSearch]);

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({ ...prev, categoryIds: prev.categoryIds.includes(categoryId) ? prev.categoryIds.filter(id => id !== categoryId) : [...prev.categoryIds, categoryId] }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFiles(prev => [...prev, ...filesArray]);
            const newPreviews = filesArray.map(file => ({ url: URL.createObjectURL(file), type: file.type }));
            setFilePreviews(prev => [...prev, ...newPreviews]);
        }
    };
    
    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.categoryIds.length === 0) {
            setError("Vui lòng chọn ít nhất một danh mục.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (!user || !user.userId) {
                throw new Error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.");
            }
            
            // *** BẮT ĐẦU SỬA LỖI ***
            // Thêm latitude và longitude từ state 'position' vào dữ liệu gửi đi
            const dataToSubmit = { 
                ...formData, 
                latitude: position.lat,
                longitude: position.lng,
                createdBy: user.userId 
            };
            // *** KẾT THÚC SỬA LỖI ***

            await createLocationByStaff(dataToSubmit, files); 
            
            alert("Thêm địa điểm thành công! Địa điểm đã được thêm trực tiếp vào hệ thống.");
            navigate('/staff/locations');
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi thêm địa điểm.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
    );
    const selectedCategories = categories.filter(cat => formData.categoryIds.includes(cat.categoryId));

    return (
        <div className="add-location-page">
             <header className="page-header">
                <h1>Thêm địa điểm mới (Nhân viên)</h1>
                <p>Cung cấp thông tin chi tiết để thêm địa điểm vào hệ thống.</p>
            </header>
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-column">
                        <div className="form-card">
                            <h3 className="card-title">Thông tin cơ bản</h3>
                            <div className="form-group"><label htmlFor="name">Tên địa điểm</label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="description">Mô tả chi tiết</label><textarea id="description" name="description" rows="5" value={formData.description} onChange={handleInputChange} required></textarea></div>
                            <div className="form-group"><label htmlFor="location">Địa chỉ</label><input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Nhập địa chỉ để tự động tìm..." required />{mapSearchLoading && <small className="loading-text">Đang tìm kiếm...</small>}</div>
                            <div className="form-group">
                                <label>Danh mục</label>
                                <div className="multi-select-container" ref={categoryDropdownRef}><div className="multi-select-input" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}><span className="multi-select-placeholder">{selectedCategories.length > 0 ? `${selectedCategories.length} đã chọn` : "Chọn danh mục"}</span><span>▼</span></div>{isCategoryDropdownOpen && (<div className="multi-select-dropdown"><input type="text" placeholder="Tìm kiếm..." className="multi-select-search" value={categorySearchTerm} onChange={(e) => setCategorySearchTerm(e.target.value)} /><ul className="multi-select-list">{filteredCategories.length > 0 ? filteredCategories.map(cat => (<li key={cat.categoryId} className="multi-select-item" onClick={() => handleCategoryChange(cat.categoryId)}><input type="checkbox" checked={formData.categoryIds.includes(cat.categoryId)} readOnly /><label>{cat.name}</label></li>)) : <li className="multi-select-item-not-found">Không tìm thấy</li>}</ul></div>)}</div>
                                <div className="selected-pills-container">{selectedCategories.map(cat => (<div key={cat.categoryId} className="selected-pill">{cat.name}<button type="button" className="selected-pill-remove" onClick={() => handleCategoryChange(cat.categoryId)}>&times;</button></div>))}</div>
                            </div>
                        </div>
                        <div className="form-card">
                            <h3 className="card-title">Thông tin bổ sung</h3>
                            <div className="form-row"><div className="form-group"><label htmlFor="openTime">Giờ mở cửa</label><input type="time" id="openTime" name="openTime" value={formData.openTime} onChange={handleInputChange} /></div><div className="form-group"><label htmlFor="closeTime">Giờ đóng cửa</label><input type="time" id="closeTime" name="closeTime" value={formData.closeTime} onChange={handleInputChange} /></div></div>
                            <div className="form-group"><label htmlFor="price">Giá tham khảo (VNĐ)</label><input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} placeholder="Để trống nếu miễn phí" /></div>
                            <div className="form-group"><label htmlFor="phoneNumber">Số điện thoại</label><input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} /></div>
                            <div className="form-group"><label htmlFor="website">Website</label><input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://example.com" /></div>
                        </div>
                    </div>
                    <div className="form-column">
                        <div className="form-card">
                            <h3 className="card-title">Vị trí trên bản đồ</h3>
                            <p className="card-subtitle">Kéo thả ghim hoặc nhấp vào bản đồ để chọn vị trí</p>
                            <div className="map-container"><MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapController position={position} setPosition={setPosition} setAddress={setAddressFromMap} /></MapContainer></div>
                        </div>
                        <div className="form-card">
                            <h3 className="card-title">Thư viện hình ảnh và video</h3>
                            <div className="image-upload-container"><label htmlFor="file-upload" className="image-upload-label"><FaUpload /> Tải lên tệp</label><input id="file-upload" type="file" multiple accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }}/></div>
                            <div className="image-preview-grid">{filePreviews.map((preview, index) => (<div key={index} className="image-preview-item">{preview.type.startsWith('image/') ? <img src={preview.url} alt={`Preview ${index}`} /> : <video src={preview.url} autoPlay loop muted playsInline /> }<button type="button" className="remove-image-btn" onClick={() => removeFile(index)}><FaTrash /></button></div>))}</div>
                        </div>
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Hủy</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu địa điểm'}
                    </button>
                </div>
            </form>
        </div>
    );
}