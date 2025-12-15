import React, { useState } from 'react';
import './IntroducePage.css'; // Dòng này để import file CSS
import { createContactInfo } from '../services/api';
import Chatbot from '../components/Chatbot'; // <-- THÊM DÒNG NÀY

// Dữ liệu mẫu cho các đối tác và testimonial của họ
const testimonialsData = [
  {
    id: 1,
    name: 'The Local Restaurant',
    logo: 'https://placehold.co/150x50/CBD5E0/4A5568?text=The+Local',
    avatar: 'https://i.pravatar.cc/100?u=a042581f4e29026704d',
    author: 'Anh Minh Tuấn',
    title: 'Chủ nhà hàng The Local',
    testimonial: 'Nhờ TravelSuggest, lượng khách du lịch đến nhà hàng của chúng tôi đã tăng 40% chỉ trong 3 tháng. Nền tảng rất dễ sử dụng và đội ngũ hỗ trợ thì tuyệt vời!'
  },
  {
    id: 2,
    name: 'Serene Homestay',
    logo: 'https://placehold.co/150x50/CBD5E0/4A5568?text=Serene+Stay',
    avatar: 'https://i.pravatar.cc/100?u=b082581f4e29026704a',
    author: 'Chị Lan Anh',
    title: 'Quản lý Serene Homestay',
    testimonial: 'Nền tảng giúp chúng tôi tiếp cận được đúng đối tượng khách hàng mục tiêu. Các công cụ phân tích và báo cáo rất trực quan, giúp tôi tối ưu hóa chiến dịch hiệu quả.'
  },
  {
    id: 3,
    name: 'Adventure Tours',
    logo: 'https://placehold.co/150x50/CBD5E0/4A5568?text=Adventure+Co',
    avatar: 'https://i.pravatar.cc/100?u=c122581f4e29026704b',
    author: 'Anh Quốc Bảo',
    title: 'Điều hành Adventure Tours',
    testimonial: 'Tính năng tạo chiến dịch quảng cáo linh hoạt đã giúp các tour du lịch mạo hiểm của chúng tôi luôn nổi bật và thu hút nhiều bạn trẻ đăng ký tham gia.'
  },
  {
    id: 4,
    name: 'Craft Coffee',
    logo: 'https://placehold.co/150x50/CBD5E0/4A5568?text=Craft+Coffee',
    avatar: 'https://i.pravatar.cc/100?u=d192581f4e29026704c',
    author: 'Chị Thảo Vy',
    title: 'Sáng lập Craft Coffee',
    testimonial: 'TravelSuggest là cầu nối tuyệt vời giữa quán cà phê nhỏ của chúng tôi và cộng đồng du khách quốc tế. Doanh thu của chúng tôi đã cải thiện rõ rệt.'
  }
];

function IntroducePage() {
  const [openFaq, setOpenFaq] = useState(1);
  const [selectedTestimonial, setSelectedTestimonial] = useState(testimonialsData[0].id);

  // State để quản lý dữ liệu form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    note: ''
  });
  const [formStatus, setFormStatus] = useState({ loading: false, message: '', error: false });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const activeTestimonial = testimonialsData.find(t => t.id === selectedTestimonial);

  // Hàm xử lý khi input thay đổi
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, message: '', error: false });

    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      setFormStatus({ loading: false, message: 'Vui lòng điền đầy đủ các trường bắt buộc.', error: true });
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        note: formData.note
      };
      await createContactInfo(payload);
      setFormStatus({ loading: false, message: 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', error: false });
      setFormData({ fullName: '', email: '', phoneNumber: '', note: '' }); // Reset form
    } catch (error) {
      console.error("Error submitting contact form:", error);
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setFormStatus({ loading: false, message: errorMessage, error: true });
    }
  };

  return (
    <div className="introduce-page">
      {/* Header */}
      <header className="header">
        <div className="container header__container">
          <h1 className="header__logo">TravelSuggest</h1>
          <nav className="header__nav">
            <a href="#benefits" className="header__nav-link">Lợi ích</a>
            <a href="#how-it-works" className="header__nav-link">Cách hoạt động</a>
            <a href="#pricing" className="header__nav-link">Bảng giá</a>
            <a href="#contact" className="button button--primary header__cta">Liên hệ tư vấn</a>
          </nav>
          <button className="header__mobile-menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* 1. Hero Section */}
        <section className="hero-section">
          <div className="container hero-section__container">
            <h2 className="hero-section__title">Thu hút du khách ngay khi họ cần bạn nhất</h2>
            <p className="hero-section__subtitle">Nền tảng của chúng tôi kết nối trực tiếp doanh nghiệp của bạn với hàng ngàn du khách đang tìm kiếm địa điểm và dịch vụ xung quanh. Tăng cường sự hiện diện, thu hút khách hàng tiềm năng và đo lường hiệu quả một cách dễ dàng.</p>
            <a href="#contact" className="button button--primary button--large hero-section__cta">Bắt đầu quảng cáo ngay</a>
          </div>
        </section>

        {/* 2. Lợi ích nổi bật */}
        <section id="benefits" className="section">
          <div className="container">
            <div className="section-header">
              <h3 className="section-header__title">Tại sao nên hợp tác với chúng tôi?</h3>
              <p className="section-header__subtitle">Những lợi ích vượt trội dành riêng cho doanh nghiệp của bạn.</p>
            </div>
            <div className="benefits__grid">
              {/* Benefit 1 */}
              <div className="benefit-card">
                <div className="benefit-card__icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h4 className="benefit-card__title">Tiếp cận đúng khách hàng</h4>
                <p className="benefit-card__description">Nổi bật và tiếp cận trực tiếp đến du khách đang có nhu cầu thực sự tại khu vực của bạn.</p>
              </div>
              {/* Benefit 2 */}
              <div className="benefit-card">
                <div className="benefit-card__icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m0-8v-2m0 8v-2m-6-2h2m12 0h2M7.05 7.05l1.414 1.414M15.536 15.536l1.414 1.414M18.364 5.636l-1.414 1.414M5.636 18.364l-1.414 1.414" /></svg>
                </div>
                <h4 className="benefit-card__title">Chủ động quản lý</h4>
                <p className="benefit-card__description">Tự quản lý và cập nhật thông tin, hình ảnh, dịch vụ để đảm bảo luôn chính xác và hấp dẫn.</p>
              </div>
              {/* Benefit 3 */}
              <div className="benefit-card">
                <div className="benefit-card__icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h4 className="benefit-card__title">Đo lường hiệu quả</h4>
                <p className="benefit-card__description">Các báo cáo, thống kê về lượt xem, tương tác giúp bạn hiểu rõ hiệu quả quảng bá.</p>
              </div>
              {/* Benefit 4 */}
              <div className="benefit-card">
                <div className="benefit-card__icon-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h4 className="benefit-card__title">Tăng mức độ hiển thị</h4>
                <p className="benefit-card__description">Tạo các chiến dịch quảng cáo để tăng mức độ hiển thị và được ưu tiên xuất hiện hàng đầu.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Cách thức hoạt động */}
        <section id="how-it-works" className="section section--gray">
            <div className="container">
                <div className="section-header">
                    <h3 className="section-header__title">Bắt đầu chỉ với 4 bước đơn giản</h3>
                    <p className="section-header__subtitle">Quy trình tinh gọn giúp bạn nhanh chóng kết nối với khách hàng.</p>
                </div>
                <div className="how-it-works__timeline">
                    <div className="how-it-works__line"></div>
                    <div className="how-it-works__grid">
                        {/* Step 1 */}
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-number">1</div>
                            <h4 className="how-it-works__step-title">Đăng ký tài khoản</h4>
                            <p className="how-it-works__step-description">Tạo tài khoản, cung cấp thông tin và chờ phê duyệt nhanh chóng.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-number">2</div>
                            <h4 className="how-it-works__step-title">Quản lý địa điểm</h4>
                            <p className="how-it-works__step-description">Dễ dàng đăng tải, cập nhật thông tin chi tiết, hình ảnh, giờ hoạt động.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-number">3</div>
                            <h4 className="how-it-works__step-title">Tạo chiến dịch</h4>
                            <p className="how-it-works__step-description">Thiết lập quảng cáo tùy chỉnh để ưu tiên hiển thị và thu hút sự chú ý.</p>
                        </div>
                        {/* Step 4 */}
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-number">4</div>
                            <h4 className="how-it-works__step-title">Theo dõi & Phân tích</h4>
                            <p className="how-it-works__step-description">Xem báo cáo trực quan về hiệu quả để tối ưu hóa chiến lược.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. Highlight Feature Section */}
        <section id="highlight" className="section">
            <div className="container">
                <div className="features__grid">
                    <div className="features__image-wrapper">
                        {/* Sử dụng hình ảnh bạn đã cung cấp */}
                        <img src="images/Screenshot 2025-09-15 101216.png" alt="Giao diện hiển thị địa điểm quảng cáo nổi bật" className="features__image" />
                    </div>
                    <div className="features__content">
                        <h3 className="section-header__title" style={{ textAlign: 'left' }}>Làm nổi bật doanh nghiệp của bạn</h3>
                        <p className="section-header__subtitle" style={{ textAlign: 'left' }}>Khi quảng cáo, địa điểm của bạn không chỉ xuất hiện ở vị trí đầu tiên mà còn được thiết kế đặc biệt để thu hút mọi ánh nhìn.</p>
                        <div className="features__list">
                            <div className="feature-item">
                                <div className="feature-item__icon" style={{ backgroundColor: 'var(--green-100)', color: 'var(--green-800)' }}>★</div>
                                <div className="feature-item__text">
                                    <h4 className="feature-item__title">Vị Trí Vàng & Ưu Tiên Hàng Đầu</h4>
                                    <p className="feature-item__description">Địa điểm của bạn sẽ luôn được ghim ở những vị trí đầu tiên trong kết quả tìm kiếm và đề xuất, đảm bảo tiếp cận tối đa khách hàng.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-item__icon" style={{ backgroundColor: 'var(--green-100)', color: 'var(--green-800)' }}>★</div>
                                <div className="feature-item__text">
                                    <h4 className="feature-item__title">Thiết Kế Nổi Bật & Khác Biệt</h4>
                                    <p className="feature-item__description">Thẻ địa điểm được thiết kế với màu sắc, nhãn "Quảng cáo" và các yếu tố trực quan khác biệt, giúp thu hút sự chú ý ngay lập tức.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-item__icon" style={{ backgroundColor: 'var(--green-100)', color: 'var(--green-800)' }}>★</div>
                                <div className="feature-item__text">
                                    <h4 className="feature-item__title">Các Nút Kêu Gọi Hành Động (CTA)</h4>
                                    <p className="feature-item__description">Tích hợp các nút "Chỉ đường", "Gọi ngay" trực tiếp trên thẻ, giúp khách hàng dễ dàng tương tác và đưa ra quyết định nhanh chóng.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 5. Features & Dashboard Preview */}
        <section className="section section--gray">
          <div className="container">
            <div className="features__grid">
              <div className="features__content">
                <h3 className="section-header__title" style={{ textAlign: 'left' }}>Công cụ mạnh mẽ trong tay bạn</h3>
                <p className="section-header__subtitle" style={{ textAlign: 'left' }}>Chúng tôi cung cấp một trang quản trị trực quan, dễ sử dụng để bạn kiểm soát mọi thứ.</p>
                <div className="features__list">
                  <div className="feature-item">
                    <div className="feature-item__icon">✓</div>
                    <div className="feature-item__text">
                      <h4 className="feature-item__title">Quản lý địa điểm & dịch vụ</h4>
                      <p className="feature-item__description">Thêm, sửa, xóa thông tin địa điểm, hình ảnh, menu một cách nhanh chóng.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-item__icon">✓</div>
                    <div className="feature-item__text">
                      <h4 className="feature-item__title">Tạo và quản lý quảng cáo</h4>
                      <p className="feature-item__description">Thiết lập và điều hành các chiến dịch quảng cáo theo ngân sách và mục tiêu.</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-item__icon">✓</div>
                    <div className="feature-item__text">
                      <h4 className="feature-item__title">Xem báo cáo kinh doanh</h4>
                      <p className="feature-item__description">Truy cập vào các báo cáo chi tiết về hiệu quả, tương tác của khách hàng.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="features__image-wrapper">
                <img src="/images/Screenshot (349).png" alt="Giao diện quản trị" className="features__image" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Social Proof */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h3 className="section-header__title">Được tin cậy bởi các doanh nghiệp hàng đầu</h3>
              <p className="section-header__subtitle">Tham gia cùng cộng đồng các đối tác đang phát triển mạnh mẽ.</p>
            </div>
            
            {/* Logos that can be clicked */}
            <div className="social-proof__logos">
              {testimonialsData.map((item) => (
                <button 
                  key={item.id} 
                  className={`social-proof__logo-btn ${selectedTestimonial === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedTestimonial(item.id)}
                  aria-label={`Xem đánh giá từ ${item.name}`}
                >
                  <img src={item.logo} alt={item.name} />
                </button>
              ))}
            </div>

            {/* The testimonial that changes based on click */}
            {activeTestimonial && (
              <div className="testimonial" key={activeTestimonial.id}>
                <img src={activeTestimonial.avatar} alt={`Avatar của ${activeTestimonial.author}`} className="testimonial__avatar" />
                <p className="testimonial__text">"{activeTestimonial.testimonial}"</p>
                <p className="testimonial__author">{activeTestimonial.author}</p>
                <p className="testimonial__author-title">{activeTestimonial.title}</p>
              </div>
            )}
          </div>
        </section>

        {/* 7. Pricing - UPDATED SECTION */}
        <section id="pricing" className="section section--gray">
          <div className="container">
            <div className="section-header">
              <h3 className="section-header__title">Gói dịch vụ quảng cáo linh hoạt</h3>
              <p className="section-header__subtitle">Chọn gói phù hợp nhất với quy mô và mục tiêu kinh doanh của bạn.</p>
            </div>
            <div className="pricing__grid">
              {/* Plan 1: 1 Month */}
              <div className="pricing-card">
                <h4 className="pricing-card__title">Gói 1 Tháng</h4>
                <p className="pricing-card__description">Lựa chọn linh hoạt để bắt đầu chiến dịch quảng cáo.</p>
                <p className="pricing-card__price">1.500.000<span> VNĐ</span></p>
                <ul className="pricing-card__features">
                  <li>✓ Ưu tiên hiển thị trong kết quả tìm kiếm</li>
                  <li>✓ Tiếp cận khách hàng mục tiêu</li>
                  <li>✓ Báo cáo hiệu quả cơ bản</li>
                  <li>✓ Hỗ trợ 24/7</li>
                </ul>
                <a href="#contact" className="button button--secondary">Chọn gói 1 tháng</a>
              </div>
              {/* Plan 2: 6 Months (Best Value) */}
              <div className="pricing-card pricing-card--popular">
                <span className="pricing-card__badge">Tiết kiệm nhất 22%</span>
                <h4 className="pricing-card__title">Gói 6 Tháng</h4>
                <p className="pricing-card__description">Tối đa hóa hiệu quả và tiết kiệm chi phí cho kế hoạch dài hạn.</p>
                <p className="pricing-card__price">7.000.000<span> VNĐ</span></p>
                <ul className="pricing-card__features">
                  <li className="font-semibold">✓ Mọi quyền lợi của Gói 3 Tháng</li>
                  <li className="font-semibold">✓ Mức độ ưu tiên hiển thị cao nhất</li>
                  <li className="font-semibold">✓ Được đề xuất nổi bật trong mục "Khám phá"</li>
                  <li className="font-semibold">✓ Tối ưu hóa chiến dịch bởi chuyên gia</li>
                </ul>
                <a href="#contact" className="button button--primary">Chọn gói 6 tháng</a>
              </div>
              {/* Plan 3: 3 Months */}
              <div className="pricing-card">
                <span className="pricing-card__badge" style={{ backgroundColor: 'var(--gray-800)' }}>Tiết kiệm 11%</span>
                <h4 className="pricing-card__title">Gói 3 Tháng</h4>
                <p className="pricing-card__description">Giải pháp cân bằng giữa chi phí và hiệu quả, phù hợp cho các chiến dịch vừa và nhỏ.</p>
                <p className="pricing-card__price">4.000.000<span> VNĐ</span></p>
                <ul className="pricing-card__features">
                  <li className="font-semibold">✓ Mọi quyền lợi của Gói 1 Tháng</li>
                  <li>✓ Tăng mức độ ưu tiên hiển thị</li>
                  <li>✓ Báo cáo hiệu quả chi tiết</li>
                  <li>✓ Hỗ trợ qua email và điện thoại</li>
                </ul>
                <a href="#contact" className="button button--dark">Chọn gói 3 tháng</a>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Contact & FAQ */}
        <section id="contact" className="section">
          <div className="container">
            <div className="contact__grid">
              <div className="contact-form">
                <h3 className="section-header__title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Liên hệ với chúng tôi</h3>
                <p className="section-header__subtitle" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>Để lại thông tin, đội ngũ chuyên viên sẽ tư vấn cho bạn trong thời gian sớm nhất.</p>
                
                <form className="form" onSubmit={handleSubmit}>
                  <div className="form__group">
                    <label htmlFor="fullName" className="form__label">Tên của bạn</label>
                    <input type="text" id="fullName" className="form__input" value={formData.fullName} onChange={handleInputChange} required />
                  </div>
                  <div className="form__group">
                    <label htmlFor="email" className="form__label">Email</label>
                    <input type="email" id="email" className="form__input" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="form__group">
                    <label htmlFor="phoneNumber" className="form__label">Số điện thoại</label>
                    <input type="tel" id="phoneNumber" className="form__input" value={formData.phoneNumber} onChange={handleInputChange} required />
                  </div>
                  <div className="form__group">
                    <label htmlFor="note" className="form__label">Lời nhắn</label>
                    <textarea id="note" rows="4" className="form__input" value={formData.note} onChange={handleInputChange}></textarea>
                  </div>

                  {formStatus.message && (
                    <p className={`form__status ${formStatus.error ? 'form__status--error' : 'form__status--success'}`}>
                      {formStatus.message}
                    </p>
                  )}

                  <button type="submit" className="button button--primary button--full" disabled={formStatus.loading}>
                    {formStatus.loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </form>
              </div>
              {/* FAQ */}
              <div className="faq">
                <h3 className="section-header__title" style={{textAlign: 'left', marginBottom: '1.5rem'}}>Câu hỏi thường gặp</h3>
                <div className="faq__list">
                  {/* FAQ 1 */}
                  <div className="faq-item">
                    <button onClick={() => toggleFaq(1)} className="faq-item__question">
                      <span>Làm thế nào để đăng ký tài khoản doanh nghiệp?</span>
                      <span>{openFaq === 1 ? '−' : '+'}</span>
                    </button>
                    {openFaq === 1 && (
                      <div className="faq-item__answer">
                        Bạn chỉ cần nhấn vào nút "Liên hệ tư vấn", điền các thông tin cơ bản về doanh nghiệp. Chúng tôi sẽ xem xét và phê duyệt tài khoản của bạn trong vòng 24 giờ làm việc.
                      </div>
                    )}
                  </div>
                  {/* FAQ 2 */}
                  <div className="faq-item">
                    <button onClick={() => toggleFaq(2)} className="faq-item__question">
                      <span>Tôi có thể hủy gói dịch vụ bất cứ lúc nào không?</span>
                      <span>{openFaq === 2 ? '−' : '+'}</span>
                    </button>
                    {openFaq === 2 && (
                      <div className="faq-item__answer">
                        Có, bạn hoàn toàn có thể hủy hoặc thay đổi gói dịch vụ của mình bất kỳ lúc nào ngay trên trang quản trị tài khoản.
                      </div>
                    )}
                  </div>
                  {/* FAQ 3 */}
                  <div className="faq-item">
                    <button onClick={() => toggleFaq(3)} className="faq-item__question">
                      <span>Quy trình thanh toán hoạt động như thế nào?</span>
                      <span>{openFaq === 3 ? '−' : '+'}</span>
                    </button>
                    {openFaq === 3 && (
                      <div className="faq-item__answer">
                        Chúng tôi tích hợp cổng thanh toán VNPay, hỗ trợ thanh toán an toàn và tiện lợi qua mã QR, thẻ ngân hàng và ví điện tử. Hóa đơn sẽ được gửi tự động đến email của bạn.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__container">
          <p>&copy; 2025 TravelSuggest. Đã đăng ký bản quyền.</p>
          <div className="footer__links">
            <a href="#contact" className="footer__link">Điều khoản dịch vụ</a>
            <a href="#contact" className="footer__link">Chính sách bảo mật</a>
          </div>
        </div>
      </footer>
      
      {/* THÊM COMPONENT CHATBOT VÀO ĐÂY */}
      <Chatbot />
    </div>
  );
}

export default IntroducePage;