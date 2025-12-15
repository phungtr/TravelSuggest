// src/page-user/UseComponent/AiRecommendationsTab.jsx
import React, { useState } from 'react';

const AiRecommendationsTab = ({ recommendations, isLoading, onSearch, onNavigateToRoute }) => {
    const [locationQuery, setLocationQuery] = useState('');
    // State mới để theo dõi thẻ nào đang được mở rộng
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);

    // Hàm xử lý khi nhấn vào một thẻ
    const handleCardClick = (index) => {
        // Nếu thẻ đang chọn đã mở, thì đóng lại. Ngược lại, mở thẻ đó ra.
        setExpandedCardIndex(expandedCardIndex === index ? null : index);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (locationQuery.trim()) {
            onSearch(locationQuery);
        }
    };
    
    // Hàm xử lý khi nhấn nút "Chỉ đường"
    const handleRouteClick = (e, item) => {
        e.stopPropagation(); // Ngăn sự kiện click của thẻ cha
        onNavigateToRoute(item);
    };

    return (
        <div className="ai-recommendations-wrapper">
            <form onSubmit={handleSubmit} className="ai-search-form">
                <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Bạn muốn du lịch ở đâu? (VD: Đà Nẵng)"
                    className="ai-search-input"
                    disabled={isLoading}
                />
                <button type="submit" className="ai-search-button" disabled={isLoading}>
                    Gửi
                </button>
            </form>
            
            {isLoading ? (
                <p>Đang tải đề xuất từ AI...</p>
            ) : !recommendations || recommendations.length === 0 ? (
                <p>Không có đề xuất nào từ AI cho bạn.</p>
            ) : (
                <div className="suggestions-grid">
                    {recommendations.map((item, index) => (
                        <div
                            key={item.name || index}
                            className={`ai-suggestion-card ${expandedCardIndex === index ? 'expanded' : ''}`}
                            onClick={() => handleCardClick(index)} 
                        >
                            <div className="ai-card-header">
                                <img src="/images/ai.png" alt={item.name} className="ai-card-image"/>
                                <div className="ai-card-info">
                                    <h4 className="ai-card-title">{item.name}</h4>
                                    <p className="ai-card-address">{item.location}</p>
                                </div>
                            </div>
                            
                            {/* Phần hiển thị lý do (chỉ hiện khi được chọn) */}
                            {expandedCardIndex === index && (
                                <div className="ai-card-reason">
                                    <p><strong>Lý do đề xuất:</strong> {item.reason}</p>
                                    <button 
                                        className="ai-card-route-btn"
                                        onClick={(e) => handleRouteClick(e, item)}
                                    >
                                        Chỉ đường đến đây
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AiRecommendationsTab;