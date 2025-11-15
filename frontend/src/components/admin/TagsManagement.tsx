// =============================================
// Tags Management Component
// Quản lý lĩnh vực cố vấn (Tags)
// =============================================

import React, { useState } from "react";
import {
    Box,
    Button,
    Chip,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

// ============ TYPES ============

/** Kiểu dữ liệu cho Tag */
interface Tag {
    id: number;
    name: string;
    mentorsCount?: number;
    requestCount?: number;
    systemRequest?: string;
}

// ============ MOCK DATA ============
// TODO: Thay bằng API call thực tế

/** Danh sách tags đã được duyệt */
const APPROVED_TAGS: Tag[] = [
    { id: 1, name: "Web Development", mentorsCount: 15 },
    { id: 2, name: "UI/UX Design", mentorsCount: 9 },
    { id: 3, name: "Machine Learning", mentorsCount: 7 },
    { id: 4, name: "Blockchain", mentorsCount: 4 },
    { id: 5, name: "Digital Marketing", mentorsCount: 12 },
];

/** Danh sách tags chờ duyệt */
const PENDING_TAGS: Tag[] = [
    { id: 6, name: "Cybersecurity", requestCount: 20, systemRequest: "Duyệt" },
    { id: 7, name: "Data Visualization", requestCount: 10, systemRequest: "Hợp nhất" },
    { id: 8, name: "Prompt Engineering", requestCount: 15, systemRequest: "Kiểm tra thủ công" },
    { id: 9, name: "DevOps", requestCount: 12, systemRequest: "Duyệt" },
];

// ============ COMPONENT ============

const TagsManagement: React.FC = () => {
    // ============ STATE ============
    const [search, setSearch] = useState<string>("");
    const [tabIndex, setTabIndex] = useState<number>(0);

    // ============ FILTERED DATA ============
    // Lọc danh sách tags theo từ khóa tìm kiếm
    const filteredApproved = APPROVED_TAGS.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(search.toLowerCase())
    );
    const filteredPending = PENDING_TAGS.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(search.toLowerCase())
    );

    // ============ HANDLERS ============

    /**
     * Xử lý phê duyệt tag
     */
    const handleApprove = (tagName: string) => {
        // TODO: Gọi API để phê duyệt tag
        alert(`Phê duyệt: ${tagName}`);
    };

    /**
     * Xử lý từ chối tag
     */
    const handleReject = (tagName: string) => {
        // TODO: Gọi API để từ chối tag
        alert(`Từ chối: ${tagName}`);
    };

    /**
     * Xử lý thêm tag mới
     */
    const handleAddNewTag = () => {
        // TODO: Mở modal để thêm tag mới
        alert('Thêm tag mới');
    };

    // ============ TABLE CONFIGURATION ============

    // Cấu hình cột cho DataGrid
    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Tên Tag",
            flex: 1,
            minWidth: 200
        },
        {
            field: "requestCount",
            headerName: "Lượt đề xuất",
            width: 160,
            align: "center",
            headerAlign: "center",
        },
        {
            field: "systemRequest",
            headerName: "Gợi ý của hệ thống",
            width: 200,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const value = params.value as string;
                const color =
                    value === "Duyệt"
                        ? "success"
                        : value === "Hợp nhất"
                            ? "primary"
                            : "warning";
                return <Chip label={value} color={color} size="small" />;
            },
        },
        {
            field: "action",
            headerName: "Hành động",
            width: 300,
            align: "center",
            headerAlign: "center",
            sortable: false,
            renderCell: (params) => (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                    marginTop={1}
                >
                    <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(params.row.name)}
                    >
                        Phê duyệt
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleReject(params.row.name)}
                    >
                        Từ chối
                    </Button>
                </Box>
            ),
        },
    ];

    // ============ RENDER ============

    return (
        <Box sx={{ p: 3, backgroundColor: "#fff", borderRadius: 2 }}>
            {/* 🏷️ Tiêu đề */}
            <Typography variant="h6" fontWeight={600} mb={1}>
                Quản lý Lĩnh vực Cố vấn (Tags)
            </Typography>
            <Typography color="grey" mb={2}>
                Quản lý các Tag hiện có và phê duyệt các đề xuất mới để đảm bảo tính nhất quán của hệ thống.
            </Typography>

            {/* Tabs */}
            {/* Tabs chuyển đổi giữa tags đã duyệt và chờ duyệt */}
            <Tabs
                value={tabIndex}
                onChange={(_, newValue) => setTabIndex(newValue)}
                sx={{ borderBottom: "1px solid #ddd", mb: 2 }}
            >
                <Tab
                    label={`Tags đã duyệt (${APPROVED_TAGS.length})`}
                    sx={{
                        color: tabIndex === 0 ? "#1976d2" : "gray",
                        fontWeight: tabIndex === 0 ? "bold" : "normal",
                        textTransform: "none",
                    }}
                />
                <Tab
                    label={`Đề xuất chờ duyệt (${PENDING_TAGS.length})`}
                    sx={{
                        color: tabIndex === 1 ? "#1976d2" : "gray",
                        fontWeight: tabIndex === 1 ? "bold" : "normal",
                        textTransform: "none",
                    }}
                />
            </Tabs>

            {/* Thanh công cụ: Tìm kiếm và Thêm tag */}
            <Box display="flex" gap={2} mb={2}>
                <TextField
                    placeholder="🔍 Tìm kiếm Tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1 }}
                    size="small"
                />
                {tabIndex === 0 && (
                    <Button
                        variant="contained"
                        onClick={handleAddNewTag}
                        sx={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#45a049" },
                        }}
                    >
                        + Thêm Tag mới
                    </Button>
                )}
            </Box>

            {/* Nội dung Tabs */}
            {tabIndex === 0 ? (
                // Tab 1: Hiển thị tags đã duyệt dạng Chips
                <Box display="flex" flexWrap="wrap" gap={1.5}>
                    {filteredApproved.length > 0 ? (
                        filteredApproved.map((tag: Tag) => (
                            <Chip
                                key={tag.id}
                                label={`${tag.name} (${tag.mentorsCount} Mentor${tag.mentorsCount && tag.mentorsCount > 1 ? "s" : ""
                                    })`}
                                sx={{
                                    bgcolor: "#1877F2",
                                    color: "#FFFFFF",
                                    fontWeight: "bold",
                                    fontSize: "0.9rem",
                                    padding: "4px 8px",
                                }}
                            />
                        ))
                    ) : (
                        <Typography color="text.secondary">
                            Không tìm thấy tag nào.
                        </Typography>
                    )}
                </Box>
            ) : (
                // Tab 2: Hiển thị tags chờ duyệt dạng bảng
                <Box sx={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={filteredPending}
                        columns={columns}
                        pageSizeOptions={[5, 10]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 5 } },
                        }}
                        disableRowSelectionOnClick
                        disableColumnResize
                        sx={{
                            border: "1px solid #ddd",
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#f5f5f5",
                                fontWeight: "bold",
                            },
                            "& .MuiDataGrid-cell": {
                                alignItems: "center",
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default TagsManagement;
