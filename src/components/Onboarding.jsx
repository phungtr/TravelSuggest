import React, { useState } from 'react';
import Swal from 'sweetalert2'; // 1. Đảm bảo đã import
import './Onboarding.css';
import { updateUserProfile } from '../services/api';

// Dữ liệu cho các bước onboarding
const onboardingData = {
  travelStyles: ["Khám phá", "Thư giãn", "Mạo hiểm", "Ẩm thực", "Sôi động"],
  interests: ["Ẩm thực & Cafe", "Văn hóa & Lịch sử", "Thiên nhiên & Phong cảnh", "Mua sắm & Giải trí", "Nghệ thuật & Sáng tạo", "Hoạt động ngoài trời"],
  budgets: ["Tiết kiệm", "Trung bình", "Sang trọng"],
  companions: ["Một mình", "Cặp đôi", "Gia đình", "Bạn bè"],
};

// Component con cho mỗi lựa chọn
const OptionCard = ({ label, isSelected, onClick }) => (
  <div className={`option-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
    {label}
  </div>
);

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    travelStyles: [],
    interests: [],
    budget: '',
    companions: [],
  });
  const [loading, setLoading] = useState(false);

  const handleMultiSelect = (category, value) => {
    setSelections(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      }
      
      // 2. Thay thế alert() bằng Swal.fire()
      if (category === 'interests' && current.length >= 3) {
        Swal.fire({
          icon: 'warning',
          title: 'Lưu ý',
          text: 'Bạn chỉ có thể chọn tối đa 3 sở thích!',
          timer: 2000,
          showConfirmButton: false
        });
        return prev; // Ngăn không cho chọn thêm
      }

      return { ...prev, [category]: [...current, value] };
    });
  };

  const handleSingleSelect = (category, value) => {
    setSelections(prev => ({ ...prev, [category]: value }));
  };
  
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const userId = user.accountId; 
        if (!userId) {
            throw new Error("Không tìm thấy thông tin người dùng (ID).");
        }
        await updateUserProfile(userId, selections);
        
        // 3. Thay thế alert thành công bằng Swal.fire
        await Swal.fire({
          title: 'Hoàn tất!',
          text: 'Cảm ơn bạn! Hồ sơ đã được cập nhật.',
          icon: 'success',
          timer: 2000, // Tự động đóng sau 2 giây
          showConfirmButton: false
        });
        onComplete();
    } catch (error) {
        // 4. Thay thế alert lỗi bằng Swal.fire
        Swal.fire({
          title: 'Có lỗi xảy ra!',
          text: `Lỗi khi cập nhật hồ sơ: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'Thử lại'
        });
    } finally {
        setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2>Chào mừng bạn đến với TravelSuggest!</h2>
            <p>Hãy dành vài phút để chúng tôi hiểu hơn về bạn nhé.</p>
          </>
        );
      case 2:
        return (
          <>
            <h2>Bạn là người du lịch theo phong cách nào?</h2>
            <p>Chọn một hoặc nhiều phong cách bạn yêu thích.</p>
            <div className="options-grid">
              {onboardingData.travelStyles.map(style => (
                <OptionCard key={style} label={style} isSelected={selections.travelStyles.includes(style)} onClick={() => handleMultiSelect('travelStyles', style)} />
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2>Bạn quan tâm đến những hoạt động nào nhất?</h2>
            <p>Chọn tối đa 3 mục.</p>
            <div className="options-grid">
              {onboardingData.interests.map(interest => (
                <OptionCard key={interest} label={interest} isSelected={selections.interests.includes(interest)} onClick={() => handleMultiSelect('interests', interest)} />
              ))}
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2>Mức chi tiêu của bạn cho chuyến đi?</h2>
            <p>Chọn một mục phù hợp nhất.</p>
            <div className="options-grid">
              {onboardingData.budgets.map(budget => (
                <OptionCard key={budget} label={budget} isSelected={selections.budget === budget} onClick={() => handleSingleSelect('budget', budget)} />
              ))}
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h2>Bạn thường đi du lịch cùng ai?</h2>
            <p>Chọn các lựa chọn phù hợp.</p>
            <div className="options-grid">
              {onboardingData.companions.map(comp => (
                <OptionCard key={comp} label={comp} isSelected={selections.companions.includes(comp)} onClick={() => handleMultiSelect('companions', comp)} />
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const totalSteps = 5;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="progress-bar">
          <div className="progress-bar-inner" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>

        <div className="onboarding-content">
          {renderStep()}
        </div>

        <div className="onboarding-footer">
          {step > 1 && <button className="btn-secondary" onClick={prevStep}>Quay lại</button>}
          {step < totalSteps && <button className="btn-primary" onClick={nextStep}>Tiếp theo</button>}
          {step === totalSteps && <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Đang lưu...' : 'Hoàn tất'}</button>}
        </div>
      </div>
    </div>
  );
}