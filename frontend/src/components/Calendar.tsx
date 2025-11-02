import React, { useState } from 'react'
import '../styles/Calendar.css'

export default function Calendar() {
  const [currentMonth] = useState('Tháng 10, 2025')
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
  const startDay = 2 // Tuesday

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button>←</button>
        <span>{currentMonth}</span>
        <button>→</button>
      </div>

      <div className="view-toggle">
        <button 
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Tuần
        </button>
        <button 
          className={viewMode === 'month' ? 'active' : ''}
          onClick={() => setViewMode('month')}
        >
          Tháng
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekday-header">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="days-grid">
          {Array(startDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="day empty"></div>
          ))}
          {daysInMonth.map(day => (
            <div key={day} className={`day ${day === 7 ? 'today' : ''}`}>
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-section">
        <h4>Lịch trình ngày 03/10</h4>
        <div className="schedule-list">
          <div className="schedule-item">
            <div className="schedule-time">09:00 - 10:00</div>
            <div className="schedule-event">
              <div className="event-title">Gặp Mentor Nguyễn A</div>
              <div className="event-status available">Đã xác nhận</div>
            </div>
          </div>
          
          <div className="schedule-item">
            <div className="schedule-time">14:30 - 15:30</div>
            <div className="schedule-event">
              <div className="event-title">Review Code - Dự án X</div>
              <div className="event-status busy">Đang bận</div>
            </div>
          </div>
        </div>
        
        <button className="btn-view-all">Xem chi tiết</button>
      </div>
    </div>
  )
}
