import React, { useState } from 'react'
import '../styles/Schedule.css'

interface TimeSlot { label: string; disabled?: boolean }

const TIME_SLOTS: TimeSlot[] = [
    { label: '07:30 PM', disabled: true },
    { label: '08:00 PM' },
    { label: '08:45 PM' },
    { label: '09:30 PM' },
    { label: '10:00 PM' }
]

export default function Schedule() {
    const [currentMonth] = useState('Tháng 10, 2025')
    const [selectedDay, setSelectedDay] = useState<number | null>(22)
    const [selectedSlot, setSelectedSlot] = useState<string>('08:00 PM')
    const [online, setOnline] = useState(true)
    const [purpose, setPurpose] = useState('')
    const [confirmOpen, setConfirmOpen] = useState(false)

    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
    const startDay = 0 // Bắt đầu từ Chủ nhật (Su) theo mockup

    const toggleSlot = (slot: TimeSlot) => {
        if (slot.disabled) return
        setSelectedSlot(slot.label)
    }

    return (
        <div className="schedule-layout-page">
            <div className="schedule-shell-card booking-wrapper">
                <div className="booking-header">
                    <h2 className="booking-title">Đặt lịch hẹn</h2>
                    <button className="booking-close" aria-label="Đóng">×</button>
                </div>
                <div className="booking-grid">
                    {/* Calendar Column */}
                    <div className="booking-calendar">
                        <div className="booking-cal-header">
                            <button className="booking-cal-nav" aria-label="Tháng trước">‹</button>
                            <span className="booking-cal-month">{currentMonth}</span>
                            <button className="booking-cal-nav" aria-label="Tháng sau">›</button>
                        </div>
                        <div className="booking-cal-weekdays">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="booking-cal-days">
                            {Array(startDay).fill(null).map((_, i) => <div key={`e-${i}`} className="day empty" />)}
                            {daysInMonth.map(day => {
                                const selected = day === selectedDay
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`day ${selected ? 'selected' : ''}`}
                                        onClick={() => setSelectedDay(day)}
                                        aria-pressed={selected}
                                    >{day}</button>
                                )
                            })}
                        </div>
                    </div>
                    {/* Divider */}
                    <div className="booking-divider" aria-hidden="true" />
                    {/* Time Slots Column */}
                    <div className="booking-slots">
                        <h4 className="slots-title">Khung giờ</h4>
                        <div className="slots-list">
                            {TIME_SLOTS.map(slot => {
                                const active = slot.label === selectedSlot
                                return (
                                    <button
                                        key={slot.label}
                                        type="button"
                                        disabled={slot.disabled}
                                        className={`slot-btn ${active ? 'active' : ''} ${slot.disabled ? 'disabled' : ''}`}
                                        onClick={() => toggleSlot(slot)}
                                        aria-pressed={active}
                                    >{slot.label}</button>
                                )
                            })}
                        </div>
                        <div className="online-toggle-row">
                            <span className="online-label">Online</span>
                            <button
                                type="button"
                                className={`toggle-switch ${online ? 'on' : ''}`}
                                onClick={() => setOnline(o => !o)}
                                aria-pressed={online}
                                aria-label={online ? 'Trực tuyến bật' : 'Trực tuyến tắt'}
                            >
                                <span className="toggle-knob" />
                            </button>
                        </div>
                        <div className="purpose-block">
                            <label htmlFor="purpose" className="purpose-label">Mục đích buổi hẹn</label>
                            <textarea
                                id="purpose"
                                className="purpose-textarea"
                                placeholder="Mô tả ngắn gọn mục tiêu buổi hẹn..."
                                value={purpose}
                                onChange={e => setPurpose(e.target.value)}
                            />
                        </div>
                        <div className="confirm-row">
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(true)}
                                className="booking-confirm-btn"
                                disabled={!selectedDay || !selectedSlot}
                            >Xác nhận</button>
                        </div>
                    </div>
                </div>
                {confirmOpen && (
                    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                        <div className="modal-card">
                            <h3 id="confirm-title" className="modal-title">Xác nhận lịch hẹn</h3>
                            <div className="modal-body">
                                <p><strong>Ngày:</strong> {selectedDay}/10/2025</p>
                                <p><strong>Khung giờ:</strong> {selectedSlot}</p>
                                <p><strong>Hình thức:</strong> {online ? 'Online' : 'Offline'}</p>
                                {purpose && <p><strong>Mục đích:</strong> {purpose}</p>}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setConfirmOpen(false)}>Hủy</button>
                                <button
                                    type="button"
                                    className="btn-confirm"
                                    onClick={() => { setConfirmOpen(false); }}
                                >Xác nhận</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
