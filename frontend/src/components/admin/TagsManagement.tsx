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
import '../../styles/admin/TagsManagement.css';

interface Tag {
    id: number;
    name: string;
    mentorsCount?: number;
    requestCount?: number;
    systemRequest?: string;
}

const APPROVED_TAGS: Tag[] = [
    { id: 1, name: "Web Development", mentorsCount: 15 },
    { id: 2, name: "UI/UX Design", mentorsCount: 9 },
    { id: 3, name: "Machine Learning", mentorsCount: 7 },
    { id: 4, name: "Blockchain", mentorsCount: 4 },
    { id: 5, name: "Digital Marketing", mentorsCount: 12 },
];

const PENDING_TAGS: Tag[] = [
    { id: 6, name: "Cybersecurity", requestCount: 20, systemRequest: "Duyệt" },
    { id: 7, name: "Data Visualization", requestCount: 10, systemRequest: "Hợp nhất" },
    { id: 8, name: "Prompt Engineering", requestCount: 15, systemRequest: "Kiểm tra thủ công" },
    { id: 9, name: "DevOps", requestCount: 12, systemRequest: "Duyệt" },
];

const TagsManagement: React.FC = () => {
    const [search, setSearch] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    const filteredApproved = APPROVED_TAGS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    const filteredPending = PENDING_TAGS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

    const handleApprove = (tagName: string) => alert(`Phê duyệt: ${tagName}`);
    const handleReject = (tagName: string) => alert(`Từ chối: ${tagName}`);
    const handleAddNewTag = () => alert('Thêm tag mới');

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Tên Tag', flex: 1, minWidth: 200 },
        { field: 'requestCount', headerName: 'Lượt đề xuất', width: 160, align: 'center', headerAlign: 'center' },
        {
            field: 'systemRequest', headerName: 'Gợi ý của hệ thống', width: 200, align: 'center', headerAlign: 'center',
            renderCell: (params) => {
                const value = params.value as string;
                const color = value === 'Duyệt' ? 'success' : value === 'Hợp nhất' ? 'primary' : 'warning';
                return <Chip label={value} color={color} size="small" />;
            }
        },
        {
            field: 'action', headerName: 'Hành động', width: 300, align: 'center', headerAlign: 'center', sortable: false,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Button variant="outlined" color="success" size="small" onClick={() => handleApprove(params.row.name)}>Phê duyệt</Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleReject(params.row.name)}>Từ chối</Button>
                </Box>
            )
        }
    ];

    return (
        <Box className="tags-management-container">
            <Typography variant="h6" className="tags-management-title">Quản lý Lĩnh vực Cố vấn</Typography>
            <Typography className="tags-management-subtitle">Quản lý các Tag hiện có và phê duyệt các đề xuất mới để đảm bảo tính nhất quán của hệ thống.</Typography>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} className="tags-management-tabs">
                <Tab label={`Tags đã duyệt (${APPROVED_TAGS.length})`} className={`tags-tab ${tabIndex === 0 ? 'active' : ''}`} />
                <Tab label={`Đề xuất chờ duyệt (${PENDING_TAGS.length})`} className={`tags-tab ${tabIndex === 1 ? 'active' : ''}`} />
            </Tabs>
            <Box className="tags-management-toolbar">
                <TextField placeholder="🔍 Tìm kiếm Tag..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" size="small" />
                {tabIndex === 0 && <Button variant="contained" onClick={handleAddNewTag} className="tags-add-btn">+ Thêm Tag mới</Button>}
            </Box>
            {tabIndex === 0 ? (
                <Box className="tags-chips-wrapper">
                    {filteredApproved.length ? filteredApproved.map(tag => (
                        <Chip key={tag.id} label={`${tag.name} (${tag.mentorsCount} Mentor${tag.mentorsCount && tag.mentorsCount > 1 ? 's' : ''})`} className="tag-chip" />
                    )) : <Typography color="text.secondary">Không tìm thấy tag nào.</Typography>}
                </Box>
            ) : (
                <Box className="tags-datagrid-wrapper">
                    <DataGrid
                        rows={filteredPending}
                        columns={columns}
                        pageSizeOptions={[5, 10]}
                        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                        disableRowSelectionOnClick
                        disableColumnResize
                        className="tags-datagrid"
                    />
                </Box>
            )}
        </Box>
    );
};

export default TagsManagement;
