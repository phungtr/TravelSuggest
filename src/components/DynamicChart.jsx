// src/components/DynamicChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  LineController // Đã import thêm LineController
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Đăng ký tất cả các thành phần cần thiết, bao gồm cả LineController
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  LineController
);

// Hàm để rút ngắn các nhãn (label) quá dài
const shortenLabel = (label, maxLength = 20) => {
    if (typeof label !== 'string') return label;
    if (label.length <= maxLength) return label;
    // Cắt bớt và thêm dấu "..."
    return label.substring(0, maxLength - 3) + '...';
};


const DynamicChart = ({ chartConfig }) => {
  if (!chartConfig || !chartConfig.type || !chartConfig.data) {
    return <div style={{ padding: '20px', color: '#ef4444' }}>Dữ liệu biểu đồ không hợp lệ.</div>;
  }

  // --- BẮT ĐẦU SỬA LỖI ---
  // Hàm tiện ích để "trải" (spread) một object một cách an toàn
  // Tránh lỗi khi thuộc tính có giá trị null hoặc undefined
  const safeSpread = (obj) => (obj && typeof obj === 'object' ? obj : {});

  // Tối ưu hóa các tùy chọn (options) để biểu đồ hiển thị tốt hơn và an toàn hơn
  const enhancedOptions = {
    ...safeSpread(chartConfig.options), // Giữ lại các options gốc
    responsive: true,
    maintainAspectRatio: false, // Rất quan trọng để biểu đồ co giãn theo container
    scales: {
      ...safeSpread(chartConfig.options?.scales),
      x: {
        ...safeSpread(chartConfig.options?.scales?.x),
        ticks: {
          ...safeSpread(chartConfig.options?.scales?.x?.ticks),
          autoSkip: true, // Cho phép biểu đồ tự động bỏ qua vài nhãn nếu quá dày
          maxRotation: 45, // Giới hạn góc xoay tối đa là 45 độ
          minRotation: 0,  // Giới hạn góc xoay tối thiểu là 0 độ
          // Sử dụng hàm callback để rút ngắn nhãn
          callback: function(value) {
              const label = this.getLabelForValue(value);
              return shortenLabel(label);
          }
        }
      },
      y: {
        ...safeSpread(chartConfig.options?.scales?.y),
        beginAtZero: true // Luôn bắt đầu trục Y từ 0
      }
    },
    plugins: {
        ...safeSpread(chartConfig.options?.plugins),
        legend: {
            ...safeSpread(chartConfig.options?.plugins?.legend),
            labels: {
                ...safeSpread(chartConfig.options?.plugins?.legend?.labels),
                boxWidth: 20, // Thu nhỏ ô màu chú thích
                font: {
                    size: 10 // Dùng font nhỏ hơn cho chú thích
                }
            }
        }
    }
  };
  // --- KẾT THÚC SỬA LỖI ---

  // Sử dụng enhancedOptions thay cho chartConfig.options
  return <Chart type={chartConfig.type} data={chartConfig.data} options={enhancedOptions} />;
};

export default DynamicChart;