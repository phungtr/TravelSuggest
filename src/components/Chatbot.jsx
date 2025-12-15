import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // ⚠️ THÊM DÒNG NÀY
import './Chatbot.css';
import chatbotAvatar from '../assets/images/chatbot_avatar.png'; 

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.247a.75.75 0 01-.696-.696v-3.722c0-.969.616-1.813 1.5-2.097L20.25 8.511zM6.75 9.75l-2.25-2.25a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06-1.06zM9 9.75a.75.75 0 00-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM12.75 9.75l-2.25-2.25a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06-1.06zM15 9.75a.75.75 0 00-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM15 13.5a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H15.75a.75.75 0 01-.75-.75z" />
    </svg>
);

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Chào bạn! Tôi là trợ lý ảo của TravelSuggest. Tôi có thể giúp gì cho bạn?", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatBodyRef = useRef(null);

    const suggestedQuestions = [
        "Lợi ích khi hợp tác là gì?",
        "Bảng giá dịch vụ như thế nào?",
        "Làm thế nào để đăng ký?",
    ];

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChat = () => setIsOpen(!isOpen);
    
    const processAndSendMessage = async (messageText) => {
        const userMessage = { text: messageText, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const botResponse = await sendMessageToGemini(messageText);
            const botMessage = { text: botResponse, sender: "bot" };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại.", sender: "bot" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        
        processAndSendMessage(inputValue);
        setInputValue('');
    };

    const handleSuggestedQuestionClick = (question) => {
        if (isLoading) return;
        processAndSendMessage(question);
    };

    return (
        <div className="visitor-chatbot-container">
            <button className="visitor-chatbot-toggler" onClick={toggleChat}>
                <ChatIcon />
            </button>

            {isOpen && (
                <div className="visitor-chatbot-window">
                    <div className="visitor-chatbot-header">
                        <h2>Trợ lý ảo TravelSuggest</h2>
                        <button onClick={toggleChat}>&times;</button>
                    </div>
                    <div className="visitor-chatbot-body" ref={chatBodyRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.sender}`}>
                                {msg.sender === "bot" && (
                                    <img src={chatbotAvatar} alt="Bot Avatar" className="chatbot-avatar" />
                                )}
                                {/* ⚠️ THAY ĐỔI LOGIC HIỂN THỊ TIN NHẮN TẠI ĐÂY */}
                                {msg.sender === 'bot' ? (
                                    <div className="markdown-content">
                                        <ReactMarkdown children={msg.text} />
                                    </div>
                                ) : (
                                    <p>{msg.text}</p>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message bot loading">
                                <img src={chatbotAvatar} alt="Bot Avatar" className="chatbot-avatar" />
                                <span></span><span></span><span></span>
                            </div>
                        )}
                    </div>
                    
                    {messages.length <= 1 && (
                        <div className="suggested-questions">
                            {suggestedQuestions.map((q, index) => (
                                <button key={index} onClick={() => handleSuggestedQuestionClick(q)} disabled={isLoading}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <form className="visitor-chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            id="visitor-chatbot-input"
                            name="visitor-chatbot-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập câu hỏi của bạn..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>Gửi</button>
                    </form>
                </div>
            )}
        </div>
    );
}