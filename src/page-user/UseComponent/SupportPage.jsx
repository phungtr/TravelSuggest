import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const SupportPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Yêu cầu hỗ trợ đã được gửi!\n" + JSON.stringify(form, null, 2));
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>

      <Typography variant="h4" gutterBottom align="center">
        ⚙️ Trung tâm Hỗ trợ
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Liên hệ trực tiếp</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography>Email: support@example.com</Typography>
        <Typography>Hotline: 0123 456 789</Typography>
        <Typography>Giờ làm việc: 8:00 - 22:00 hàng ngày</Typography>
      </Paper>

      {/* FAQ */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">❓ Câu hỏi thường gặp</Typography>
        <Divider sx={{ my: 1 }} />
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Làm thế nào để đặt lại mật khẩu?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Bạn có thể vào trang đăng nhập, chọn "Quên mật khẩu" và làm theo
              hướng dẫn.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Tôi có thể lưu địa điểm yêu thích ở đâu?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Hãy nhấn vào biểu tượng ❤️ trên thẻ địa điểm, hệ thống sẽ lưu
              trong mục "Yêu thích".
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Làm sao để liên hệ đội ngũ hỗ trợ nhanh?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Bạn có thể gọi hotline hoặc điền form hỗ trợ ngay bên dưới.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Form hỗ trợ */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">📩 Gửi yêu cầu hỗ trợ</Typography>
        <Divider sx={{ my: 1 }} />
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Họ và tên"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Nội dung"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Gửi yêu cầu
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SupportPage;