import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/AdvancedSettings.css";
import "../styles/Settings.css";
import Toast from "../components/Toast";

export default function AdvancedSettings() {
  const navigate = useNavigate()
  const [range, setRange] = useState(50);
  const [autoMatch, setAutoMatch] = useState(true);
  const [invisibleMode, setInvisibleMode] = useState(false);
  const [open, setOpen] = useState(false);
  const handleSave = () => {
    console.log("Settings saved:", {
      range,
      autoMatch,
      invisibleMode
    });
    setOpen(true);
  };


  return (
    <div className="advanced-container">
      <Toast
        open={open}
        onOpenChange={setOpen}
        message="Đã lưu cài đặt"
        duration={5000}
        position="top-right"
      />

      <div className="advanced-card">
        <div className="advanced-header">
          <button className="back-btn" onClick={() => navigate(-1)}>&#8592;</button>
          <h2 className="advanced-title">Cài Đặt Nâng Cao</h2>
        </div>

        {/* Matchmaking Range */}
        <div className="section">
          <h3 className="section-title">Ưu tiên Matchmaking</h3>

          <div className="slider-row">
            <span>Phạm vi tìm kiếm (Km)</span>
            <span className="slider-value">
              {range} km (Mặc định: 50 – Tối đa: 500 để tìm kiếm Toàn quốc)
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={500}
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="range-slider"
          />
        </div>

        {/* Connection Settings */}
        <div className="section">
          <h3 className="section-title">Quản lý Kết nối</h3>

          <div className="setting-row">
            <span>Tự động gia hạn Match</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoMatch}
                onChange={() => setAutoMatch(!autoMatch)}
              />
              <span className="slider-toggle"></span>
            </label>
          </div>

          <div className="setting-row clickable">
            <span>Danh sách Chặn</span>
            <button className="btn-outline">Xem</button>
          </div>
        </div>

        {/* Privacy */}
        <div className="section">
          <h3 className="section-title">Quyền Riêng tư & Bảo mật</h3>

          <div className="setting-row">
            <span>Chế độ ẩn hồ sơ</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={invisibleMode}
                onChange={() => setInvisibleMode(!invisibleMode)}
              />
              <span className="slider-toggle"></span>
            </label>
          </div>

          <div className="setting-row clickable">
            <span>Tải xuống Dữ liệu Cá nhân</span>
            <button className="btn-outline">Tải về</button>
          </div>

          <div className="setting-row clickable">
            <span className="danger-text">Yêu cầu xóa Tài khoản</span>
            <button className="btn-danger">Xóa</button>
          </div>
        </div>

        <button className="save-btn" onClick={handleSave}>LƯU CÀI ĐẶT</button>
      </div>
    </div>
  );
}
