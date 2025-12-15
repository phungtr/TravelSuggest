// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("Vui lòng cung cấp API Key của bạn trong file .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Sử dụng model 'gemini-1.5-pro-latest' mà tài khoản của bạn hỗ trợ.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

// 1. Tạo một "Knowledge Base" từ nội dung báo cáo đồ án tốt nghiệp.
const knowledgeBase = `
Thông tin về nền tảng TravelSuggest dành cho đối tác kinh doanh:

[cite_start]**Mục tiêu chính:** Nền tảng TravelSuggest được xây dựng để giải quyết bài toán kép trong ngành du lịch[cite: 65, 269]. [cite_start]Chúng tôi tạo ra một kênh marketing hiệu quả, kết nối trực tiếp các doanh nghiệp (nhà hàng, khách sạn, khu vui chơi, địa điểm tham quan...) với du khách tiềm năng ngay tại thời điểm họ có nhu cầu, dựa trên vị trí GPS và sở thích cá nhân[cite: 167, 171, 185, 247].

**Lợi ích chính cho đối tác:**
- [cite_start]**Tiếp cận đúng khách hàng mục tiêu:** Dịch vụ của bạn sẽ được gợi ý cho du khách đang ở gần và có nhu cầu thực sự, tăng khả năng chuyển đổi[cite: 171, 205, 247].
- [cite_start]**Chủ động quản lý thông tin:** Đối tác có một trang quản trị riêng để dễ dàng cập nhật thông tin địa điểm, dịch vụ, hình ảnh, giờ hoạt động... đảm bảo thông tin luôn chính xác[cite: 283, 322, 916].
- [cite_start]**Đo lường hiệu quả trực quan:** Hệ thống cung cấp dashboard với các báo cáo, thống kê về lượt xem, lượt yêu cầu chỉ đường, và hiệu quả của các chiến dịch quảng cáo[cite: 349, 924].
- [cite_start]**Tăng cường hiển thị:** Thông qua các chiến dịch quảng cáo trả phí, địa điểm của bạn sẽ được ưu tiên hiển thị ở những vị trí nổi bật nhất[cite: 324, 918].
- [cite_start]**Tương tác với khách hàng:** Doanh nghiệp có thể xem và phản hồi các đánh giá, bình luận của du khách về dịch vụ của mình[cite: 343].

**Quy trình hoạt động (5 bước):**
1.  **Đăng ký tài khoản doanh nghiệp:** Đối tác tạo tài khoản bằng cách cung cấp thông tin xác thực. [cite_start]Tài khoản sau đó sẽ ở trạng thái "Chờ duyệt"[cite: 307, 308, 904].
2.  **Phê duyệt bởi hệ thống:** Nhân viên của TravelSuggest sẽ xem xét và phê duyệt yêu cầu đăng ký của bạn. [cite_start]Bạn sẽ nhận được thông báo qua email sau khi tài khoản được kích hoạt[cite: 316, 474, 475].
3.  **Quản lý địa điểm:** Sau khi đăng nhập, bạn có thể tự thêm mới hoặc cập nhật thông tin các địa điểm, dịch vụ của mình. [cite_start]Mọi thay đổi cũng sẽ được nhân viên duyệt để đảm bảo chất lượng dữ liệu[cite: 322, 323, 917].
4.  [cite_start]**Tạo chiến dịch quảng cáo:** Bạn có thể tạo các chiến dịch quảng cáo cho địa điểm của mình, lựa chọn gói dịch vụ và thời gian phù hợp để tăng mức độ hiển thị[cite: 324, 918].
5.  **Thanh toán và Kích hoạt:** Thực hiện thanh toán an toàn qua cổng VNPay tích hợp. [cite_start]Chiến dịch sẽ được kích hoạt ngay sau khi giao dịch thành công[cite: 325, 919, 920].
6.  [cite_start]**Theo dõi & Phân tích:** Sử dụng trang tổng quan để xem báo cáo chi tiết về hiệu quả chiến dịch và các tương tác của khách hàng[cite: 349, 924].

**Bảng giá dịch vụ quảng cáo:**
- **Gói 1 Tháng:** 1.500.000 VNĐ. Lựa chọn linh hoạt để bắt đầu. Bao gồm ưu tiên hiển thị và báo cáo cơ bản.
- **Gói 3 Tháng:** 4.000.000 VNĐ (Tiết kiệm 11%). Giải pháp cân bằng, tăng mức độ ưu tiên và có báo cáo chi tiết hơn.
- **Gói 6 Tháng:** 7.000.000 VNĐ (Tiết kiệm 22%). Tối đa hóa hiệu quả với mức độ ưu tiên hiển thị cao nhất và được các chuyên gia hỗ trợ tối ưu hóa chiến dịch.

**Câu hỏi thường gặp (FAQ):**
- **Đăng ký tài khoản có phức tạp không?** Rất đơn giản. Bạn chỉ cần điền form đăng ký. [cite_start]Đội ngũ của chúng tôi sẽ xem xét và phê duyệt tài khoản trong thời gian sớm nhất[cite: 307, 308].
- **Làm thế nào để địa điểm của tôi được nổi bật?** Bạn có thể tạo chiến dịch quảng cáo và chọn các gói dịch vụ phù hợp. [cite_start]Hệ thống sẽ tự động ưu tiên hiển thị địa điểm của bạn[cite: 324, 918].
- [cite_start]**Thanh toán như thế nào?** Chúng tôi tích hợp cổng thanh toán VNPay, hỗ trợ nhiều hình thức thanh toán an toàn và tiện lợi như mã QR, thẻ ngân hàng và ví điện tử[cite: 786, 919].
`;

// 2. Cập nhật lại "lịch sử trò chuyện" ban đầu (Initial Prompt)
const chat = model.startChat({
    history: [
        {
            role: "user",
            // Ra lệnh cho AI đóng vai và sử dụng kiến thức được cung cấp
            parts: [{ text: `Bạn là một trợ lý ảo chuyên nghiệp của nền tảng TravelSuggest. Nhiệm vụ của bạn là tư vấn cho các doanh nghiệp tiềm năng về dịch vụ của chúng tôi. **Hãy luôn dựa vào thông tin được cung cấp dưới đây để trả lời câu hỏi của khách hàng. Không tự ý bịa đặt thông tin.** Nếu khách hàng hỏi những câu không liên quan, hãy lịch sự từ chối và hướng họ quay lại chủ đề.
            
            --- BẮT ĐẦU KHỐI KIẾN THỨC ---
            ${knowledgeBase}
            --- KẾT THÚC KHỐI KIẾN THỨC ---
            ` }],
        },
        {
            role: "model",
            // Lời chào mặc định của bot
            parts: [{ text: "Chào bạn! Tôi là trợ lý ảo của TravelSuggest. Tôi có thể giúp gì cho bạn về việc hợp tác và quảng cáo trên nền tảng của chúng tôi?" }],
        },
    ],
    generationConfig: {
        maxOutputTokens: 300, // Tăng giới hạn token để có câu trả lời dài hơn nếu cần
    },
});

// Hàm gửi tin nhắn không thay đổi
export const sendMessageToGemini = async (message) => {
    try {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn đến Gemini:", error);
        return "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.";
    }
};