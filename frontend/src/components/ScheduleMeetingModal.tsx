import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { meetingService, type Meeting, type ScheduleMeetingPayload } from '../services';
import '../styles/ScheduleMeetingModal.css';

interface ParticipantOption {
  id: string;
  email?: string;
  name?: string;
}

interface ScheduleMeetingModalProps {
  open: boolean;
  onClose: () => void;
  chatId: string;
  participants: ParticipantOption[];
  onCreated?: (meeting: Meeting) => void;
}

const ROUNDING_MINUTES = 15;
const DEFAULT_DURATION_MINUTES = 45;

const toInputValue = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  ].join('T');
};

const getDefaultStart = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const remainder = now.getMinutes() % ROUNDING_MINUTES;
  const offset = remainder === 0 ? ROUNDING_MINUTES : ROUNDING_MINUTES - remainder;
  now.setMinutes(now.getMinutes() + offset);
  return now;
};

const parseLocalDate = (value: string) => (value ? new Date(value) : null);

export default function ScheduleMeetingModal({
  open,
  onClose,
  chatId,
  participants,
  onCreated
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState('Cuộc hẹn mới');
  const [description, setDescription] = useState('');
  const [startValue, setStartValue] = useState('');
  const [endValue, setEndValue] = useState('');
  const [location, setLocation] = useState('');
  const [provider, setProvider] = useState<'google_meet' | 'zoom' | 'custom'>('google_meet');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState('');
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const allParticipantIds = useMemo(
    () => participants.map(participant => participant.id).filter(Boolean),
    [participants]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const start = getDefaultStart();
    const end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60000);

    setTitle('Cuộc hẹn mới');
    setDescription('');
    setStartValue(toInputValue(start));
    setEndValue(toInputValue(end));
    setProvider('google_meet');
    setLocation('');
    setSelectedIds(allParticipantIds);
    setCustomEmail('');
    setExtraEmails([]);
    setFormError(null);
    setApiError(null);
  }, [open, chatId, allParticipantIds]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const attendees = useMemo(() => {
    const fromParticipants = participants
      .filter(participant => participant.id && selectedIds.includes(participant.id))
      .map(participant => ({
        userId: participant.id,
        email: participant.email
      }));

    const fromExtras = extraEmails.map(email => ({ email, userId: undefined }));
    return [...fromParticipants, ...fromExtras]
      .filter(attendee => attendee.email || attendee.userId);
  }, [participants, selectedIds, extraEmails]);

  const toggleParticipant = (id: string) => {
    setSelectedIds(current => (
      current.includes(id) ? current.filter(existing => existing !== id) : [...current, id]
    ));
  };

  const addCustomEmail = () => {
    const trimmed = customEmail.trim();
    if (!trimmed) {
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isEmail) {
      setFormError('Email không hợp lệ');
      return;
    }
    if (extraEmails.includes(trimmed)) {
      setFormError('Email đã được thêm');
      return;
    }
    setExtraEmails(prev => [...prev, trimmed]);
    setCustomEmail('');
    setFormError(null);
  };

  const removeCustomEmail = (email: string) => {
    setExtraEmails(prev => prev.filter(item => item !== email));
  };

  const validateForm = () => {
    if (!title.trim()) {
      setFormError('Vui lòng nhập tiêu đề');
      return false;
    }
    const startDate = parseLocalDate(startValue);
    const endDate = parseLocalDate(endValue);
    if (!startDate || !endDate) {
      setFormError('Vui lòng chọn thời gian hợp lệ');
      return false;
    }
    if (startDate >= endDate) {
      setFormError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return false;
    }
    if (attendees.length === 0) {
      setFormError('Hãy chọn ít nhất một người tham dự hoặc thêm email mới');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);
    if (!validateForm()) {
      return;
    }

    const startDate = parseLocalDate(startValue);
    const endDate = parseLocalDate(endValue);
    if (!startDate || !endDate) {
      return;
    }

    const payload: ScheduleMeetingPayload = {
      chatId,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      attendees,
      location: location.trim() || undefined,
      provider
    };

    setSubmitting(true);
    try {
      const meeting = await meetingService.schedule(payload);
      onCreated?.(meeting);
      onClose();
    } catch (error: any) {
      setApiError(error?.message || 'Không thể tạo lịch hẹn');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="schedule-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="schedule-modal__header">
          <div>
            <p className="schedule-modal__eyebrow">Google Calendar</p>
            <h2 id="schedule-modal-title">Đặt lịch hẹn</h2>
          </div>
          <button type="button" className="schedule-modal__close" onClick={onClose} aria-label="Dong">
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} className="schedule-modal__body">
          <div className="schedule-layout">
            <section className="schedule-panel">
              <header>
                <h3>Thông tin cuộc hẹn</h3>
                <p>Thời gian, địa điểm và nền tảng gặp gỡ</p>
              </header>
              <label className="schedule-field">
                <span>Tiêu đề</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Cuộc họp 1:1"
                  required
                />
              </label>

              <div className="schedule-field grid">
                <label>
                  <span>Bắt đầu</span>
                  <input
                    type="datetime-local"
                    value={startValue}
                    onChange={(event) => setStartValue(event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Kết thúc</span>
                  <input
                    type="datetime-local"
                    value={endValue}
                    onChange={(event) => setEndValue(event.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="schedule-field">
                <span>Địa điểm (tuỳ chọn)</span>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Văn phòng, Google Meet..."
                />
              </label>

              <label className="schedule-field">
                <span>Mô tả (tuỳ chọn)</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Chương trình làm việc, ghi chú..."
                />
              </label>

              <label className="schedule-field">
                <span>Nền tảng</span>
                <select value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)}>
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="custom">Khác</option>
                </select>
              </label>
            </section>

            <section className="schedule-panel">
              <header>
                <h3>Người tham dự</h3>
                <p>Chọn thành viên trong cuộc trò chuyện hoặc thêm email mới</p>
              </header>
              <div className="schedule-field">
                <div className="field-label">
                  <span>Danh sách tham gia</span>
                  <small>{attendees.length} đã chọn</small>
                </div>
                <div className="participants-list">
                  {participants.length === 0 && extraEmails.length === 0 && (
                    <p className="helper-text">Không có thành viên nào trong cuộc trò chuyện</p>
                  )}
                  {participants.map(participant => (
                    <label key={participant.id} className="participant-option">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(participant.id)}
                        onChange={() => toggleParticipant(participant.id)}
                      />
                      <div>
                        <strong>{participant.name || 'Thành viên'}</strong>
                        {participant.email && <span>{participant.email}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="schedule-field">
                <span>Thêm email khác</span>
                <div className="email-adder">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(event) => setCustomEmail(event.target.value)}
                    placeholder="nhan.su@example.com"
                  />
                  <button type="button" onClick={addCustomEmail} className="email-adder__btn">
                    Thêm
                  </button>
                </div>
                {extraEmails.length > 0 && (
                  <div className="email-chips">
                    {extraEmails.map(email => (
                      <span key={email} className="email-chip">
                        {email}
                        <button type="button" aria-label="Xoá" onClick={() => removeCustomEmail(email)}>
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {(formError || apiError) && (
            <p className="schedule-modal__error" role="alert">
              {formError || apiError}
            </p>
          )}

          <div className="schedule-modal__footer">
            <button type="button" className="btn ghost" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? 'Đang tạo...' : 'Tạo lịch hẹn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
