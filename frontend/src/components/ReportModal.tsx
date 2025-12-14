// src/components/ReportModal.tsx
import React, { useState, useEffect } from 'react';
import '../styles/ReportModal.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatName: string | null;
}

interface IssueOption {
  id: string;
  label: string;
  isOther?: boolean;
}

const ISSUE_OPTIONS: IssueOption[] = [
  { id: 'abuse', label: 'Ngôn từ thô tục, xúc phạm, bắt nạt, đe dọa' },
  { id: 'harass', label: 'Quấy rối hoặc phân biệt đối xử' },
  { id: 'scam', label: 'Lừa đảo, chia sẻ nội dung độc hại' },
  { id: 'irrelevant-work', label: 'Yêu cầu mentee làm việc không liên quan' },
  { id: 'fake-info', label: 'Giả mạo hoặc thông tin sai lệch' },
  { id: 'sensitive-info', label: 'Yêu cầu thông tin nhạy cảm' },
  {
    id: 'share-without-consent',
    label: 'Tự ý chia sẻ thông tin cuộc trò chuyện khi chưa được đồng ý',
  },
  { id: 'other', label: 'Khác', isOther: true },
];

type Step = 'choose' | 'confirm';

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, chatName }) => {
  const [step, setStep] = useState<Step>('choose');
  const [selectedIssue, setSelectedIssue] = useState<IssueOption | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherDescription, setOtherDescription] = useState('');
  const [error, setError] = useState('');

  // Reset state mỗi lần mở/đóng
  useEffect(() => {
    if (!isOpen) {
      setStep('choose');
      setSelectedIssue(null);
      setShowOtherInput(false);
      setOtherDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectIssue = (issue: IssueOption) => {
    setError('');
    setSelectedIssue(issue);

    if (issue.isOther) {
      setShowOtherInput(true);
      // Không chuyển bước ngay, chờ người dùng nhập xong rồi bấm xác nhận
    } else {
      setShowOtherInput(false);
      setStep('confirm');
    }
  };

  const handleConfirmOther = () => {
    if (!otherDescription.trim()) {
      setError('Vui lòng mô tả vấn đề bạn gặp phải.');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('choose');
  };

  const handleSubmit = () => {
    // TODO: call API gửi báo cáo thật
    console.log('Send report:', {
      chatName,
      issue: selectedIssue,
      otherDescription: selectedIssue?.isOther ? otherDescription : undefined,
    });

    onClose();
  };

  return (
    <div className="report-modal-backdrop" aria-modal="true" role="dialog">
      {step === 'choose' && (
        <div className="report-dialog">
          <div className="report-dialog-header">
            <span className="report-dialog-title">Chọn vấn đề bạn muốn báo cáo</span>
            <button
              type="button"
              className="report-dialog-close"
              aria-label="Đóng"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="report-dialog-body">
            <ul className="report-issue-list">
              {ISSUE_OPTIONS.map(issue => (
                <li key={issue.id} className="report-issue-item">
                  <button
                    type="button"
                    className="report-issue-row"
                    onClick={() => handleSelectIssue(issue)}
                  >
                    <span className="report-issue-text">{issue.label}</span>
                    <span className="report-issue-arrow">{'>'}</span>
                  </button>

                  {issue.isOther && showOtherInput && selectedIssue?.id === issue.id && (
                    <div className="report-other-box">
                      <label className="report-other-label">
                        Mô tả vấn đề bạn gặp phải
                      </label>
                      <textarea
                        className="report-other-textarea"
                        placeholder="Nhập mô tả..."
                        value={otherDescription}
                        onChange={e => setOtherDescription(e.target.value)}
                        rows={3}
                      />
                      {error && <div className="report-error">{error}</div>}
                      <button
                        type="button"
                        className="report-other-confirm-btn"
                        onClick={handleConfirmOther}
                      >
                        Xác nhận
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="report-dialog report-dialog-confirm">
          <div className="report-dialog-header">
            <button
              type="button"
              className="report-dialog-back"
              aria-label="Quay lại"
              onClick={handleBack}
            >
              ←
            </button>
            <span className="report-dialog-title">Gửi báo cáo?</span>
            <button
              type="button"
              className="report-dialog-close"
              aria-label="Đóng"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="report-dialog-body report-confirm-body">
            <p>
              Khi bạn nhấn xác nhận tức là đồng ý gửi các tin nhắn gần đây trong cuộc trò
              chuyện này cho GrowNet xét duyệt.
            </p>

            {selectedIssue && (
              <div className="report-summary">
                <div className="report-summary-label">Vấn đề:</div>
                <div className="report-summary-value">{selectedIssue.label}</div>
                {selectedIssue.isOther && otherDescription && (
                  <>
                    <div className="report-summary-label">Mô tả thêm:</div>
                    <div className="report-summary-value">{otherDescription}</div>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              className="report-submit-btn"
              onClick={handleSubmit}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportModal;
