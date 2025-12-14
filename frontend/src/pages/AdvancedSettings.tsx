import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/AdvancedSettings.css";
import Toast from "../components/Toast";

export default function AdvancedSettings() {
  const navigate = useNavigate()
  const [range, setRange] = useState(50);
  const [autoMatch, setAutoMatch] = useState(true);
  const [invisibleMode, setInvisibleMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = () => {
    console.log("Settings saved:", {
      range,
      autoMatch,
      invisibleMode
    });
    setOpen(true);
  };

  const handleBlockList = () => {
    console.log("View block list");
    // TODO: Navigate to block list page
  };

  const handleDownloadData = () => {
    console.log("Download personal data");
    // TODO: Implement data download
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  return (
    <div className="advanced-container">
      <Toast
        open={open}
        onOpenChange={setOpen}
        message="Đã lưu cài đặt thành công"
        duration={5000}
        position="top-right"
      />

      <div className="advanced-card">
        <div className="advanced-header">
          <button className="back-btn" onClick={() => navigate(-1)} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h2 className="advanced-title">Cài Đặt Nâng Cao</h2>
            <p className="advanced-subtitle">Tùy chỉnh trải nghiệm của bạn</p>
          </div>
        </div>

        {/* Matchmaking Range */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Ưu tiên Matchmaking</h3>
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <div className="slider-label">
                <span>Phạm vi tìm kiếm</span>
                <p className="slider-hint">Khoảng cách tối đa để tìm kiếm người phù hợp</p>
              </div>
              <div className="slider-value-badge">
                <span className="value-number">{range}</span>
                <span className="value-unit">km</span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={500}
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="range-slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(range / 500) * 100}%, #e2e8f0 ${(range / 500) * 100}%, #e2e8f0 100%)`
              }}
            />

            <div className="slider-markers">
              <span className="marker">0 km</span>
              <span className="marker">50 km</span>
              <span className="marker">500 km</span>
            </div>
          </div>
        </div>

        {/* Connection Settings */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Quản lý Kết nối</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Tự động gia hạn Match</span>
              </div>
              <p className="setting-description">Duy trì kết nối với người bạn đã match</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoMatch}
                onChange={() => setAutoMatch(!autoMatch)}
              />
              <span className="slider-toggle"></span>
            </label>
          </div>

          <div className="setting-item clickable" onClick={handleBlockList}>
            <div className="setting-info">
              <div className="setting-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
                <span>Danh sách Chặn</span>
              </div>
              <p className="setting-description">Quản lý người dùng bạn đã chặn</p>
            </div>
            <button className="btn-outline">
              <span>Xem</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Quyền Riêng tư & Bảo mật</h3>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <span>Chế độ ẩn hồ sơ</span>
              </div>
              <p className="setting-description">Ẩn hồ sơ của bạn khỏi tìm kiếm công khai</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={invisibleMode}
                onChange={() => setInvisibleMode(!invisibleMode)}
              />
              <span className="slider-toggle"></span>
            </label>
          </div>

          <div className="setting-item clickable" onClick={handleDownloadData}>
            <div className="setting-info">
              <div className="setting-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Tải xuống Dữ liệu Cá nhân</span>
              </div>
              <p className="setting-description">Xuất toàn bộ dữ liệu cá nhân của bạn</p>
            </div>
            <button className="btn-outline">
              <span>Tải về</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className="setting-item danger-zone" onClick={handleDeleteAccount}>
            <div className="setting-info">
              <div className="setting-label danger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                <span>Yêu cầu xóa Tài khoản</span>
              </div>
              <p className="setting-description danger">Thao tác này không thể hoàn tác</p>
            </div>
            <button className="btn-danger">
              <span>Xóa</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="actions-footer">
          <button className="save-btn" onClick={handleSave}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Lưu Cài Đặt
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon danger">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3>Xác nhận xóa tài khoản</h3>
            <p>Bạn có chắc chắn muốn xóa tài khoản? Thao tác này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button className="btn-confirm-delete" onClick={() => {
                console.log("Delete account confirmed");
                setShowDeleteModal(false);
              }}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
