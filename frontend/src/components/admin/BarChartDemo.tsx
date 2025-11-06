import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Đăng ký các thành phần cần cho biểu đồ đường
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4"],
    datasets: [
        {
            label: "Doanh thu (triệu đồng)",
            data: [4000, 3000, 5000, 7000],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.3,
            fill: true,
        },
    ],
};

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const,
        },
        title: {
            display: true,
            text: "Biểu đồ đường doanh thu 4 tháng",
        },
    },
};

const LineChartDemo: React.FC = () => {
    return (
        <div className="flex justify-center items-center mt-12">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

export default LineChartDemo;
