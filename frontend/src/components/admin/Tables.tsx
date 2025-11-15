// =============================================
// User Management Tables Component
// Quản lý danh sách tài khoản và xử lý vi phạm
// =============================================

import React from "react";
import {
    Box,
    Button,
    MenuItem,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import '../../styles/admin/Tables.css';

// ============ TYPES ============

/** Kiểu dữ liệu cho User */
interface User {
    id: string;
    name: string;
    email: string;
    role: "Mentor" | "Mentee";
    status: "Hoạt động" | "Cảnh cáo" | "Đã khóa";
    reports: number;
}

// ============ CONSTANTS ============

/** Màu sắc theo trạng thái */
const STATUS_COLORS: Record<string, string> = {
    "Hoạt động": "#2e7d32",
    "Cảnh cáo": "#f57c00",
    "Đã khóa": "#c62828",
};

/** Danh sách vai trò */
const ROLES = ["Mentor", "Mentee"];

/** Danh sách trạng thái */
const STATUSES = ["Hoạt động", "Cảnh cáo", "Đã khóa"];

/** Tùy chọn lọc theo số lượt báo cáo */
const REPORT_OPTIONS = [
    { label: "Tất cả", value: "" },
    { label: "0", value: "0" },
    { label: "1–3", value: "1-3" },
    { label: "4 trở lên", value: "4+" },
];

// ============ COMPONENT ============

export default function Tables() {
    // ============ HOOKS ============
    const theme = useTheme();

    // ============ STATE ============
    const [search, setSearch] = React.useState<string>("");
    const [filterRole, setFilterRole] = React.useState<string>("");
    const [filterStatus, setFilterStatus] = React.useState<string>("");
    const [reportCount, setReportCount] = React.useState<string>("");

    // ============ MOCK DATA ============
    // TODO: Thay bằng API call thực tế
    const rows: User[] = [
        { id: "U00001", name: "Nguyễn Văn An", email: "an.nguyen@email.com", role: "Mentor", status: "Hoạt động", reports: 0 },
        { id: "U00002", name: "Trần Thị Bình", email: "binh.tran@email.com", role: "Mentee", status: "Cảnh cáo", reports: 2 },
        { id: "U00003", name: "Lê Văn Cường", email: "cuong.le@email.com", role: "Mentor", status: "Đã khóa", reports: 5 },
        { id: "U00004", name: "Phạm Thị Dung", email: "dung.pham@email.com", role: "Mentee", status: "Hoạt động", reports: 0 },
        { id: "U00005", name: "Vũ Minh Đức", email: "duc.vu@email.com", role: "Mentor", status: "Hoạt động", reports: 1 },
        { id: "U00006", name: "Hoàng Lan Anh", email: "lananh.hoang@email.com", role: "Mentee", status: "Cảnh cáo", reports: 3 },
        { id: "U00007", name: "Đặng Quốc Bảo", email: "bao.dang@email.com", role: "Mentor", status: "Đã khóa", reports: 4 },
        { id: "U00008", name: "Ngô Thị Chi", email: "chi.ngo@email.com", role: "Mentee", status: "Hoạt động", reports: 0 },
        { id: "U00009", name: "Trịnh Văn Duy", email: "duy.trinh@email.com", role: "Mentor", status: "Cảnh cáo", reports: 2 },
        { id: "U00010", name: "Lưu Thị Hằng", email: "hang.luu@email.com", role: "Mentee", status: "Hoạt động", reports: 1 },
        { id: "U00011", name: "Phan Anh Huy", email: "huy.phan@email.com", role: "Mentor", status: "Đã khóa", reports: 6 },
        { id: "U00012", name: "Đoàn Minh Khang", email: "khang.doan@email.com", role: "Mentee", status: "Hoạt động", reports: 0 },
        { id: "U00013", name: "Nguyễn Thị Linh", email: "linh.nguyen@email.com", role: "Mentor", status: "Cảnh cáo", reports: 1 },
        { id: "U00014", name: "Tô Văn Long", email: "long.to@email.com", role: "Mentee", status: "Hoạt động", reports: 0 },
        { id: "U00015", name: "Phùng Thị Mai", email: "mai.phung@email.com", role: "Mentee", status: "Đã khóa", reports: 4 },
        { id: "U00016", name: "Trương Quốc Nam", email: "nam.truong@email.com", role: "Mentor", status: "Hoạt động", reports: 0 },
        { id: "U00017", name: "Bùi Thanh Nga", email: "nga.bui@email.com", role: "Mentee", status: "Cảnh cáo", reports: 3 },
        { id: "U00018", name: "Nguyễn Văn Phúc", email: "phuc.nguyen@email.com", role: "Mentor", status: "Đã khóa", reports: 5 },
        { id: "U00019", name: "Đinh Thị Quỳnh", email: "quynh.dinh@email.com", role: "Mentee", status: "Hoạt động", reports: 0 },
        { id: "U00020", name: "Lại Văn Sơn", email: "son.lai@email.com", role: "Mentor", status: "Hoạt động", reports: 1 },
    ];


    // ============ HANDLERS ============

    /**
     * Xử lý khóa/mở khóa tài khoản
     */
    const handleToggleLock = (userId: string, currentStatus: string) => {
        // TODO: Gọi API để thay đổi trạng thái
        const action = currentStatus === "Đã khóa" ? "Mở khóa" : "Khóa";
        alert(`${action} tài khoản: ${userId}`);
    };

    /**
     * Xử lý xóa vĩnh viễn tài khoản
     */
    const handleDelete = (userId: string) => {
        // TODO: Hiển thị confirm dialog và gọi API xóa
        if (confirm(`Bạn có chắc muốn xóa vĩnh viễn tài khoản ${userId}?`)) {
            alert(`Đã xóa tài khoản: ${userId}`);
        }
    };

    // ============ TABLE CONFIGURATION ============

    // Cấu hình cột cho DataGrid
    const columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ID",
            width: 130,
            headerAlign: "center",
            align: "center"
        },
        {
            field: "name",
            headerName: "Họ tên",
            width: 300,
            headerAlign: "center",
            align: "center"
        },
        {
            field: "email",
            headerName: "Email",
            width: 300,
            headerAlign: "center",
            align: "center"
        },
        {
            field: "role",
            headerName: "Vai trò",
            width: 200,
            headerAlign: "center",
            align: "center"
        },
        {
            field: "status",
            headerName: "Trạng thái",
            width: 285,
            headerAlign: "center",
            align: "center",
            renderCell: ({ value }) => {
                const status = value as string;
                const statusClass =
                    status === 'Hoạt động' ? 'status-active' :
                        status === 'Cảnh cáo' ? 'status-warning' :
                            status === 'Đã khóa' ? 'status-locked' : '';
                return <div className={`status-chip ${statusClass}`}>{status}</div>;
            },
        },
        {
            field: "reports",
            headerName: "Số lượt báo cáo",
            width: 160,
            headerAlign: "center",
            align: "center",
        },
        {
            field: "actions",
            headerName: "Hành động",
            width: 275,
            align: "center",
            headerAlign: "center",
            sortable: false,
            renderCell: ({ row }) => {
                const user = row as User;
                return (
                    <div className="user-action-buttons">
                        <Button
                            variant="contained"
                            color={user.status === "Đã khóa" ? "success" : "warning"}
                            size="small"
                            onClick={() => handleToggleLock(user.id, user.status)}
                            sx={{ textTransform: "none" }}
                        >
                            {user.status === "Đã khóa" ? "Mở khóa" : "Khóa tạm thời"}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(user.id)}
                            sx={{ textTransform: "none" }}
                        >
                            Xóa vĩnh viễn
                        </Button>
                    </div>
                );
            },
        },
    ];

    // ============ FILTERED DATA ============

    // Lọc dữ liệu dựa trên các filter
    const filteredRows = rows.filter((user: User) => {
        const matchRole = !filterRole || user.role === filterRole;
        const matchStatus = !filterStatus || user.status === filterStatus;
        const matchReport =
            !reportCount ||
            (reportCount === "0" && user.reports === 0) ||
            (reportCount === "1-3" && user.reports >= 1 && user.reports <= 3) ||
            (reportCount === "4+" && user.reports >= 4);
        const matchSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.id.toLowerCase().includes(search.toLowerCase());

        return matchRole && matchStatus && matchReport && matchSearch;
    });

    // ============ RENDER ============
    return (
        <div className="user-table-container">
            <Typography variant="h6" className="user-table-title" style={{ color: theme.palette.primary.main }}>
                Danh sách Tài khoản
            </Typography>

            {/* Bộ lọc */}
            <div className="user-table-filters">
                <TextField
                    size="small"
                    placeholder="🔍 Tìm kiếm theo Tên, Email, ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="filter-search"
                />
                <TextField
                    select
                    label="Vai trò"
                    size="small"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="filter-role"
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    {ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                            {r}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Trạng thái"
                    size="small"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-status"
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    {STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Số lượt báo cáo"
                    size="small"
                    value={reportCount}
                    onChange={(e) => setReportCount(e.target.value)}
                    className="filter-reports"
                >
                    {REPORT_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </TextField>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="user-table-grid" style={{ ['--table-header-bg' as any]: theme.palette.grey[200] }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 5, page: 0 } },
                    }}
                    disableRowSelectionOnClick
                    disableColumnResize
                />
            </div>
        </div>
    );
}
