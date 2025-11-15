// =============================================
// Admin Dashboard Charts Component
// Hiển thị các biểu đồ thống kê cho admin
// =============================================

import React from 'react';
import { Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

// ============ CONSTANTS ============

// Cấu hình chung cho legend của tất cả charts
const LEGEND_CONFIG = {
    position: { vertical: 'bottom' as const, horizontal: 'center' as const },
    direction: 'horizontal' as const,
};

// Kích thước chuẩn cho charts
const CHART_SIZE = {
    width: 500,
    height: 400,
};

// Dữ liệu cho biểu đồ Mentor/Mentee
const ROLE_DISTRIBUTION_DATA = [
    { id: 0, value: 40, label: 'Mentor' },
    { id: 1, value: 60, label: 'Mentee' },
];

// Dữ liệu cho biểu đồ người dùng mới
const USER_GROWTH_DATA = {
    xAxis: [1, 2, 3, 4],
    series: [20, 40, 35, 50],
};

// Dữ liệu cho biểu đồ phân bổ lĩnh vực
const FIELD_DISTRIBUTION_DATA = {
    categories: ['Tech', 'Marketing', 'Finance', 'Design'],
    values: [70, 50, 20, 80],
};

// Dữ liệu cho biểu đồ tìm kiếm theo lĩnh vực
const SEARCH_BY_FIELD_DATA = [
    { id: 0, value: 40, label: 'Tech' },
    { id: 1, value: 60, label: 'Marketing' },
    { id: 2, value: 20, label: 'Finance' },
    { id: 3, value: 30, label: 'Design' },
];

// ============ COMPONENT ============

export default function Dashboard() {
    return (
        <div className="container">
            {/* Biểu đồ 1: Tỷ lệ vai trò Mentor/Mentee */}
            <div className="dashboard-container">
                <Typography variant="h6" className="typechartcontainer">
                    Tỷ lệ vai trò Mentor/Mentee
                </Typography>
                <PieChart
                    series={[
                        {
                            data: ROLE_DISTRIBUTION_DATA,
                            innerRadius: 90,
                        },
                    ]}
                    width={CHART_SIZE.width}
                    height={CHART_SIZE.height}
                    slotProps={{ legend: LEGEND_CONFIG }}
                />
            </div>

            {/* Biểu đồ 2: Tăng trưởng người dùng mới */}
            <div className="dashboard-container">
                <Typography variant="h6" className="typechartcontainer">
                    Tăng trưởng người dùng mới
                </Typography>
                <LineChart
                    xAxis={[{ data: USER_GROWTH_DATA.xAxis }]}
                    series={[
                        {
                            data: USER_GROWTH_DATA.series,
                            label: 'Người dùng',
                        },
                    ]}
                    width={CHART_SIZE.width}
                    height={CHART_SIZE.height}
                    slotProps={{ legend: LEGEND_CONFIG }}
                />
            </div>

            {/* Biểu đồ 3: Tỷ lệ phân bổ theo lĩnh vực */}
            <div className="dashboard-container">
                <Typography variant="h6" className="typechartcontainer">
                    Tỷ lệ phân bổ theo lĩnh vực
                </Typography>
                <BarChart
                    xAxis={[
                        {
                            data: FIELD_DISTRIBUTION_DATA.categories,
                            scaleType: 'band',
                        },
                    ]}
                    series={[
                        {
                            data: FIELD_DISTRIBUTION_DATA.values,
                            label: 'Tỷ lệ %',
                        },
                    ]}
                    width={CHART_SIZE.width}
                    height={CHART_SIZE.height}
                    slotProps={{ legend: LEGEND_CONFIG }}
                />
            </div>

            {/* Biểu đồ 4: Tỷ lệ tìm kiếm theo lĩnh vực */}
            <div className="dashboard-container">
                <Typography variant="h6" className="typechartcontainer">
                    Tỷ lệ tìm kiếm theo lĩnh vực
                </Typography>
                <PieChart
                    series={[
                        {
                            data: SEARCH_BY_FIELD_DATA,
                            innerRadius: 90,
                        },
                    ]}
                    width={CHART_SIZE.width}
                    height={CHART_SIZE.height}
                    slotProps={{ legend: LEGEND_CONFIG }}
                />
            </div>
        </div>
    );
}