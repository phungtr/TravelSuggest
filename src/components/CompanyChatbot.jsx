import React, { useState, useEffect } from 'react';
import {
  MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, Avatar
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import ReactMarkdown from 'react-markdown';
import DynamicChart from './DynamicChart';
import { FaRobot, FaTimes, FaChartLine } from 'react-icons/fa';
import './CompanyChatbot.css'; 
import botAvatar from '../assets/images/chatbot_avatar.png';
import Modal from './Modal'; 

// Sửa đổi hàm render để nhận thêm hàm onOpenReportModal
const renderMessageContent = (msg, openChartModal, onOpenReportModal) => {
    // 1. Kiểm tra xem có phải là tin nhắn báo cáo không
    if (msg.type === 'REPORT_ATTACHMENT' && msg.payload) {
        return (
            <Message.CustomContent>
                {/* Sử dụng lại style của ccb-chart-attachment cho giống với yêu cầu */}
                <div className="ccb-chart-attachment" onClick={() => onOpenReportModal(msg.payload)}>
                    <div className="ccb-chart-attachment-icon"><FaChartLine /></div>
                    <div className="ccb-chart-attachment-info">
                        <span className="ccb-chart-attachment-title">{msg.payload.title}</span>
                        <span className="ccb-chart-attachment-subtitle">Nhấp để xem chi tiết báo cáo</span>
                    </div>
                </div>
            </Message.CustomContent>
        );
    }

    // Logic cũ để xử lý biểu đồ dạng JSON thông thường
    let chartConfig = null;
    try {
      if (typeof msg.message === 'string' && msg.message.trim().startsWith('{')) {
        chartConfig = JSON.parse(msg.message);
      }
    } catch (e) { chartConfig = null; }

    if (chartConfig && chartConfig.type && chartConfig.data) {
      return (
        <Message.CustomContent>
          <div className="ccb-chart-attachment" onClick={() => openChartModal(chartConfig)}>
            <div className="ccb-chart-attachment-icon"><FaChartLine /></div>
            <div className="ccb-chart-attachment-info">
              <span className="ccb-chart-attachment-title">{chartConfig.options?.plugins?.title?.text || 'Biểu đồ phân tích'}</span>
              <span className="ccb-chart-attachment-subtitle">Nhấp để xem chi tiết</span>
            </div>
          </div>
        </Message.CustomContent>
      );
    }
    
    return (
        <Message.CustomContent>
            <ReactMarkdown children={msg.message} />
        </Message.CustomContent>
    );
};

// Component nhận thêm prop onOpenReportModal
const CompanyChatbot = ({ companyId, initialInsight, onInsightHandled, onOpenReportModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { message: "Xin chào! Tôi là Trợ lý Phân tích AI. Hãy hỏi tôi một câu hỏi hoặc chọn gợi ý bên dưới để bắt đầu.", sender: "AI", direction: "incoming" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalChartConfig, setModalChartConfig] = useState(null);

  useEffect(() => {
    if (initialInsight && initialInsight.id) {
      // 2. Chatbot tự mở ra
      setIsOpen(true);
      
      const reportAttachmentMessage = {
          sender: "AI",
          direction: "incoming",
          type: 'REPORT_ATTACHMENT', // Đánh dấu đây là loại tin nhắn mới
          payload: initialInsight // Gói toàn bộ dữ liệu insight vào payload
      };

      const introMessage = {
        message: "Tôi có một báo cáo mới dành cho bạn!",
        sender: "AI",
        direction: "incoming"
      };

      // 3. Hiển thị tin nhắn giới thiệu và thẻ đính kèm báo cáo
      setMessages(prev => [prev[0], introMessage, reportAttachmentMessage]);

      const markAsRead = async (insightId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.token) return;
            await fetch(`hhttps://datn-nodejs-yg5k.onrender.com/api/proactive-insights/${insightId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${user.token}` },
            });
            // 4. Báo cho layout biết đã xử lý xong để reset state
            if (onInsightHandled) {
                onInsightHandled();
            }
        } catch (error) {
            console.error("Lỗi khi đánh dấu insight là đã đọc:", error);
        }
      };
      
      markAsRead(initialInsight.id);
    }
  }, [initialInsight, onInsightHandled]);

  const openChartModal = (chartConfig) => {
    setModalChartConfig(chartConfig);
    setIsModalOpen(true);
  };
  const closeChartModal = () => {
    setIsModalOpen(false);
    setModalChartConfig(null);
  };

  const suggestedQuestions = [
    "Tóm tắt hiệu suất tổng quan.",
    "Vẽ biểu đồ tăng trưởng lượt xem tháng qua.",
    "Phân tích hiệu suất quảng cáo.",
    "Đề xuất cách cải thiện tương tác.",
  ];
  
  const handleSend = async (messageText) => {
    const userMessage = {
      message: messageText,
      sender: "user",
      direction: "outgoing"
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        throw new Error("Không tìm thấy token xác thực.");
      }

      const response = await fetch('https://datn-nodejs-yg5k.onrender.com/api/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: companyId,
          message: messageText,
          token: user.token
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || `Lỗi từ server: ${response.statusText}`);
      }
      
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const jsonData = await response.json();
        const aiMessage = {
          message: JSON.stringify(jsonData),
          sender: "AI",
          direction: "incoming"
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponseContent = "";
        
        const initialAiMessage = { message: "", sender: "AI", direction: "incoming" };
        setMessages(prev => [...prev, initialAiMessage]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiResponseContent += chunk;
          
          setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1].message = aiResponseContent;
            return updatedMessages;
          });
        }
      }

    } catch (error) {
      const errorMessage = {
        message: `**Lỗi:** ${error.message || "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại."}`,
        sender: "AI",
        direction: "incoming"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="ccb-container">
        <div className={`ccb-window ${isOpen ? 'open' : ''}`}>
            <header className="ccb-header">
                <div className="ccb-header-info">
                    <Avatar src={botAvatar} name="AI Assistant" />
                    <div className="ccb-header-text">
                        <div className="ccb-header-title">Trợ lý AI</div>
                        <div className="ccb-header-status">Online</div>
                    </div>
                </div>
                <button className="ccb-close-btn" onClick={() => setIsOpen(false)}>
                    <FaTimes />
                </button>
            </header>
            <MainContainer>
                <ChatContainer>
                    <MessageList typingIndicator={isTyping ? <TypingIndicator content="Trợ lý AI đang phân tích..." /> : null}>
                        {messages.map((msg, i) => (
                            <Message key={i} model={msg}>
                                {msg.sender === 'AI' && <Avatar src={botAvatar} name="AI" />}
                                {/* 5. Truyền onOpenReportModal vào hàm render */}
                                {renderMessageContent(msg, openChartModal, onOpenReportModal)}
                            </Message>
                        ))}
                        {messages.length <= 1 && !isTyping && (
                            <Message model={{ direction: 'incoming', position: 'single' }}>
                                <Avatar src={botAvatar} name="AI" />
                                <Message.CustomContent>
                                    <div className="ccb-suggested-questions">
                                        {suggestedQuestions.map((q, i) => (
                                            <button key={i} onClick={() => handleSend(q)}>{q}</button>
                                        ))}
                                    </div>
                                </Message.CustomContent>
                            </Message>
                        )}
                    </MessageList>
                    <MessageInput
                        placeholder="Nhập câu hỏi phân tích..."
                        onSend={handleSend}
                        attachButton={false}
                        disabled={isTyping}
                    />
                </ChatContainer>
            </MainContainer>
        </div>

        <button className="ccb-fab" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaRobot />}
        </button>
      </div>

      {/* Modal này chỉ dùng cho các biểu đồ thông thường, không phải báo cáo tuần */}
      <Modal isOpen={isModalOpen} onClose={closeChartModal} title={modalChartConfig?.options?.plugins?.title?.text || 'Biểu đồ chi tiết'}>
          {modalChartConfig && (
              <div style={{ height: '100%', width: '100%' }}>
                  <DynamicChart chartConfig={modalChartConfig} />
              </div>
          )}
      </Modal>
    </>
  );
};

export default CompanyChatbot;