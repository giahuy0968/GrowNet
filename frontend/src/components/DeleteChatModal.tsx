import React from 'react';
import '../styles/DeleteChatModal.css';

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteChatModal({ isOpen, onClose, onConfirm }: DeleteChatModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="delete-chat-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        
        {/* === Header === */}
        <div className="modal-header">
          <h3 id="modal-title" className="header-title">
            Xóa lịch sử trò chuyện
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            &times; {/* Ký tự 'x' */}
          </button>
        </div>

        {/* === Body === */}
        <div className="modal-body">
          <p className="modal-message">
            Bạn không thể hoàn tác sau khi xóa bản sao của cuộc trò chuyện này.
          </p>
        </div>

        {/* === Footer/Actions === */}
        <div className="modal-actions">
          <button 
            className="btn-cancel" 
            onClick={onClose}
          >
            Hủy
          </button>
          <button 
            className="btn-delete-confirm" 
            onClick={onConfirm}
          >
            Xóa đoạn chat
          </button>
        </div>
      </div>
    </div>
  );
}