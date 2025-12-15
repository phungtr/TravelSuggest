// src/page-auth/AuthPage.jsx
import React, { useState } from "react";
import Swal from 'sweetalert2'; // <-- 1. Thêm import
import { login, registerUser, registerCompany } from "../services/api";
import "./AuthPage.css";

// --- Import ảnh từ thư mục assets ---
import userImage from '../assets/images/User.jpg';
import companyImage from '../assets/images/Company.jpg';

// --- Component Footer ---
const Footer = () => (
    <footer className="auth-footer">
        <p>© 2025 TravelSuggest · Giúp bạn tìm đường và khám phá.</p>
        <p>Email hỗ trợ: <a href="mailto:support@example.com">support@example.com</a></p>
    </footer>
);

// --- LoginView ---
const LoginView = ({ onLogin, setView }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await onLogin({ username, password });
        } catch (err) {
            // <-- 2. Thay thế alert -->
            Swal.fire({
                title: 'Đăng nhập thất bại',
                text: err.message || "Vui lòng kiểm tra lại tên đăng nhập hoặc mật khẩu.",
                icon: 'error'
            });
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Đi đến nơi bạn muốn</h2>
                <form className="auth-form" onSubmit={handleLogin}>
                    <label>Tên đăng nhập:</label>
                    <input value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <label>Mật khẩu:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="auth-btn">Đăng nhập</button>
                </form>
                <p className="auth-link">
                    Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('registerChoice'); }}>Đăng ký</a>
                </p>
            </div>
            <Footer />
        </div>
    );
};

// --- RegisterChoiceView ---
const RegisterChoiceView = ({ setView }) => (
    <div className="register-choice-wrapper">
        <div className="dark-overlay"></div>
        <div className="register-choice-container">
            <h2>Bạn muốn đăng ký với vai trò:</h2>
            <div className="register-options">
                <div className="register-card" onClick={() => setView('registerUser')}>
                    <img src={userImage} alt="Người dùng" />
                    <p>Du khách</p>
                </div>
                <div className="register-card" onClick={() => setView('registerCompany')}>
                    <img src={companyImage} alt="Doanh nghiệp" />
                    <p>Doanh nghiệp</p>
                </div>
            </div>
             <p className="auth-link" style={{ marginTop: '2rem', fontSize: '1rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Quay lại đăng nhập</a>
            </p>
        </div>
    </div>
);

// --- UserRegisterView ---
const UserRegisterView = ({ setView }) => {
    const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            // <-- 3. Thay thế alert -->
            return Swal.fire('Lỗi!', 'Mật khẩu không khớp.', 'error');
        }
        try {
            await registerUser(form);
            // <-- 4. Thay thế alert -->
            Swal.fire('Thành công!', 'Đăng ký tài khoản thành công!', 'success');
            setView('login');
        } catch (err) {
            // <-- 5. Thay thế alert -->
            Swal.fire('Lỗi!', err.response?.data?.message || err.message || "Đăng ký thất bại.", 'error');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Tạo tài khoản của bạn</h2>
                <form className="auth-form" onSubmit={handleRegister}>
                    <label>Tên đăng nhập:</label>
                    <input name="username" value={form.username} onChange={handleChange} required />
                    <label>Email:</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    <label>Mật khẩu:</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required />
                    <label>Xác nhận mật khẩu:</label>
                    <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
                    <button type="submit" className="auth-btn">Đăng ký</button>
                </form>
                <p className="auth-link">
                    Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Đăng nhập</a>
                </p>
            </div>
            <Footer />
        </div>
    );
};

// --- CompanyRegisterView ---
const CompanyRegisterView = ({ setView }) => {
    const [form, setForm] = useState({ username: "", companyName: "", taxCode: "", email: "", password: "", confirm: "" });
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            // <-- 6. Thay thế alert -->
            return Swal.fire('Lỗi!', 'Mật khẩu không khớp.', 'error');
        }
        try {
            const response = await registerCompany(form);
            // <-- 7. Thay thế alert -->
            if (response.data.status === "PENDING") {
                Swal.fire('Thành công!', 'Tài khoản đã được tạo và đang chờ phê duyệt.', 'info');
            } else {
                Swal.fire('Thành công!', 'Đăng ký tài khoản thành công!', 'success');
            }
            setView('login');
        } catch (err) {
            // <-- 8. Thay thế alert -->
            Swal.fire('Lỗi!', err.response?.data?.message || err.message || "Đăng ký thất bại.", 'error');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Tạo tài khoản doanh nghiệp</h2>
                <form className="auth-form" onSubmit={handleRegister}>
                    <label>Tên đăng nhập:</label>
                    <input name="username" value={form.username} onChange={handleChange} required />
                    <label>Tên công ty:</label>
                    <input name="companyName" value={form.companyName} onChange={handleChange} required />
                    <label>Mã số thuế:</label>
                    <input name="taxCode" value={form.taxCode} onChange={handleChange} required />
                    <label>Email:</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    <label>Mật khẩu:</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required />
                    <label>Xác nhận mật khẩu:</label>
                    <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
                    <button type="submit" className="auth-btn">Đăng ký</button>
                </form>
                <p className="auth-link">
                    Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }}>Đăng nhập</a>
                </p>
            </div>
            <Footer />
        </div>
    );
};

// --- COMPONENT CHÍNH ---
export default function AuthPage({ onLogin }) {
    const [view, setView] = useState('login'); 

    if (view === 'registerChoice') {
        return <RegisterChoiceView setView={setView} />;
    }
    if (view === 'registerUser') {
        return <UserRegisterView setView={setView} />;
    }
    if (view === 'registerCompany') {
        return <CompanyRegisterView setView={setView} />;
    }
    return <LoginView onLogin={onLogin} setView={setView} />;
}