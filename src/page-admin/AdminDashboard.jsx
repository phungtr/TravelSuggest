// src/page-admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Import Link
import { FaUsers, FaBuilding, FaMapMarkerAlt, FaStar, FaUserTie, FaDollarSign } from 'react-icons/fa';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { getAdminDashboardSummary, getAdminDashboardGrowth } from '../services/api'; 
import './AdminDashboard.css'; 

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

// <-- 2. Update StatCard to accept a 'path' prop for the link -->
const StatCard = ({ title, count, icon, color, path }) => (
    <Link to={path} className="stat-card-link">
        <div className="stat-card">
            <div>
                <p className="stat-title">{title}</p>
                <p className="stat-count">{count}</p>
            </div>
            <div className={`stat-icon-wrapper icon-${color}`}>{icon}</div>
        </div>
    </Link>
);

const ChartCard = ({ title, children }) => (
    <div className="widget-card">
        <h3 className="widget-title">{title}</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                {children}
            </ResponsiveContainer>
        </div>
    </div>
);

export default function AdminDashboard() {
    // ... (rest of the component logic remains the same)
    const [stats, setStats] = useState({
        usersByRole: {},
        totalLocations: 0,
        totalReviews: 0,
        totalRevenue: 0,
    });
    const [chartData, setChartData] = useState({
        roleDistribution: [],
        growthData: [],
    });
    const [loading, setLoading] = useState(true);
    const [period] = useState('month');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, growthRes] = await Promise.all([
                getAdminDashboardSummary(),
                getAdminDashboardGrowth(period),
            ]);
            const summaryData = summaryRes.data || {};
            setStats({
                usersByRole: summaryData.usersByRole || {},
                totalLocations: summaryData.totalLocations || 0,
                totalReviews: summaryData.totalReviews || 0,
                totalRevenue: summaryData.totalRevenue || 0,
            });
            const roleDistribution = Object.keys(summaryData.usersByRole || {}).map(role => ({
                name: role,
                value: summaryData.usersByRole[role]
            }));
            const growthData = growthRes.data || {};
            const { userGrowth = [], locationGrowth = [], reviewGrowth = [] } = growthData;
            const mergedData = new Map();
            const processGrowthData = (data, keyName) => {
                data.forEach(item => {
                    const date = new Date(item.period);
                    const timePoint = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    if (!mergedData.has(timePoint)) {
                        mergedData.set(timePoint, {
                            time: timePoint,
                            "Người dùng mới": 0,
                            "Địa điểm mới": 0,
                            "Đánh giá mới": 0,
                        });
                    }
                    mergedData.get(timePoint)[keyName] += item.count;
                });
            };
            processGrowthData(userGrowth, "Người dùng mới");
            processGrowthData(locationGrowth, "Địa điểm mới");
            processGrowthData(reviewGrowth, "Đánh giá mới");
            const formattedGrowthData = Array.from(mergedData.values()).sort((a, b) => {
                const [ma, ya] = a.time.split('/');
                const [mb, yb] = b.time.split('/');
                return new Date(ya, ma - 1) - new Date(yb, mb - 1);
            });
            setChartData({
                roleDistribution,
                growthData: formattedGrowthData
            });
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard admin:", error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // ---

    // <-- 3. Add 'path' to each card's data object -->
    const statCards = [
        { title: "Tổng Người dùng", count: stats.usersByRole['USER'] || 0, icon: <FaUsers />, color: "blue", path: "/admin/users" },
        { title: "Tổng Đối tác", count: stats.usersByRole['COMPANY'] || 0, icon: <FaBuilding />, color: "green", path: "/admin/companies" },
        { title: "Tổng Nhân viên", count: stats.usersByRole['STAFF'] || 0, icon: <FaUserTie />, color: "purple", path: "/admin/staff" },
        { title: "Tổng Doanh thu", count: formatCurrency(stats.totalRevenue), icon: <FaDollarSign />, color: "yellow", path: "/admin/dashboard" }, // This one can link back to dashboard
    ];
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="dashboard-page-container">
            <div className="stats-grid">
                {loading ? (
                    <p>Đang tải dữ liệu thống kê...</p>
                ) : (
                    statCards.map((card, index) => <StatCard key={index} {...card} />)
                )}
            </div>
            
            <div className="admin-charts-grid">
                 <ChartCard title="Tăng trưởng theo thời gian">
                    {loading ? <p>Đang tải dữ liệu biểu đồ...</p> : (
                        <LineChart data={chartData.growthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Người dùng mới" stroke="#8884d8" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Địa điểm mới" stroke="#82ca9d" />
                            <Line type="monotone" dataKey="Đánh giá mới" stroke="#ffc658" />
                        </LineChart>
                    )}
                </ChartCard>
                
                <ChartCard title="Phân bổ các loại tài khoản">
                     {loading ? <p>Đang tải dữ liệu biểu đồ...</p> : (
                        <PieChart>
                            <Pie
                                data={chartData.roleDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.roleDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                     )}
                </ChartCard>
            </div>
        </div>
    );
}