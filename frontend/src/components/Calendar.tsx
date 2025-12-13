import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { meetingService, type Meeting } from '../services'
import '../styles/Calendar.css'

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

const formatDateKey = (date: Date) => date.toISOString().split('T')[0]
const padNumber = (value: number) => value.toString().padStart(2, '0')

const monthLabel = (date: Date) => `Tháng ${padNumber(date.getMonth() + 1)}, ${date.getFullYear()}`
const dayMonthLabel = (date: Date) => `${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}`
const formatTimeRange = (start: Date, end: Date) => {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1)

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const today = new Date()

export default function Calendar() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const fetchMeetings = async () => {
      try {
        setLoading(true)
        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999)
        const { meetings: data } = await meetingService.listMine({
          start: start.toISOString(),
          end: end.toISOString()
        })

        if (!active) {
          return
        }

        setMeetings(data)
        setError(null)
      } catch (err) {
        if (active) {
          setError('Không thể tải lịch trình. Hãy thử lại.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchMeetings()

    return () => {
      active = false
    }
  }, [currentMonth, reloadKey])

  useEffect(() => {
    const sameMonth =
      selectedDate.getFullYear() === currentMonth.getFullYear() &&
      selectedDate.getMonth() === currentMonth.getMonth()

    if (!sameMonth) {
      setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
    }
  }, [currentMonth, selectedDate])

  const meetingsByDate = useMemo(() => {
    return meetings.reduce<Record<string, Meeting[]>>((acc, meeting) => {
      const key = formatDateKey(new Date(meeting.startTime))
      acc[key] = acc[key] ? [...acc[key], meeting] : [meeting]
      return acc
    }, {})
  }, [meetings])

  const selectedMeetings = useMemo(() => {
    const key = formatDateKey(selectedDate)
    const dailyMeetings = meetingsByDate[key] || []
    return [...dailyMeetings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [meetingsByDate, selectedDate])

  const firstDay = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth])
  const daysInMonth = useMemo(() => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate(), [currentMonth])
  const leadingEmptyCells = useMemo(() => {
    const weekday = firstDay.getDay() // 0 = CN
    return (weekday + 6) % 7 // convert to Monday-first
  }, [firstDay])

  const calendarDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

  const goToPrevMonth = () => setCurrentMonth(prev => addMonths(prev, -1))
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))

  const handleRetry = () => setReloadKey(prev => prev + 1)

  const handleMeetingClick = (meeting: Meeting) => {
    if (meeting.chatId) {
      navigate(`/chat/${meeting.chatId}`, { state: { chatId: meeting.chatId } })
    }
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <button onClick={goToPrevMonth} aria-label="Tháng trước">←</button>
        <span>{monthLabel(currentMonth)}</span>
        <button onClick={goToNextMonth} aria-label="Tháng sau">→</button>
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
          {WEEKDAY_LABELS.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="days-grid">
          {Array.from({ length: leadingEmptyCells }).map((_, index) => (
            <div key={`empty-${index}`} className="day empty" aria-hidden="true" />
          ))}

          {calendarDays.map(day => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const key = formatDateKey(date)
            const hasEvents = Boolean(meetingsByDate[key]?.length)
            const isSelected = isSameDay(date, selectedDate)
            const isToday = isSameDay(date, today)

            return (
              <button
                type="button"
                key={day}
                className={`day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      <div className="schedule-section">
        <h4>Lịch trình ngày {dayMonthLabel(selectedDate)}</h4>

        {loading && <p className="calendar-status">Đang tải lịch trình...</p>}
        {!loading && error && (
          <div className="calendar-status calendar-status--error">
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>Thử lại</button>
          </div>
        )}

        {!loading && !error && selectedMeetings.length === 0 && (
          <p className="schedule-empty">Chưa có cuộc hẹn nào cho ngày này.</p>
        )}

        {!loading && !error && selectedMeetings.length > 0 && (
          <div className="schedule-list">
            {selectedMeetings.map(meeting => {
              const start = new Date(meeting.startTime)
              const end = new Date(meeting.endTime)
              return (
                <div
                  key={meeting._id}
                  className="schedule-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleMeetingClick(meeting)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleMeetingClick(meeting)
                    }
                  }}
                >
                  <div className="schedule-time">{formatTimeRange(start, end)}</div>
                  <div className="schedule-event">
                    <div className="event-title">{meeting.title}</div>
                    {meeting.description && <small className="event-note">{meeting.description}</small>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-view-all" onClick={() => navigate('/schedule', { state: { date: selectedDate.toISOString() } })}>
            Xem chi tiết
          </button>
          <button className="btn-view-all" onClick={() => navigate('/mentorSchedule')}>
            Mở trang đặt lịch
          </button>
        </div>
      </div>
    </div>
  )
}
