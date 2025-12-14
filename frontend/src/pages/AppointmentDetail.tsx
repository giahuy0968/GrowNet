import React, { useState } from 'react';
import '../styles/AppointmentDetail.css';

type TimeSlot = {
    id: number;
    time: string;
    selected: boolean;
};

const AppointmentDetail: React.FC = () => {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
        { id: 1, time: '07:30 PM', selected: false },
        { id: 2, time: '08:00 PM', selected: false },
        { id: 3, time: '08:45 PM', selected: false },
        { id: 4, time: '09:30 PM', selected: false },
        { id: 5, time: '10:00 PM', selected: false },
    ]);

    const [selectedDate, setSelectedDate] = useState<number | null>(4); // Ngày 4 được chọn mặc định

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const daysInMonth = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
    ];

    const handleTimeSlotClick = (id: number) => {
        setTimeSlots(timeSlots.map(slot => ({
            ...slot,
            selected: slot.id === id
        })));
    };

    const handleDateClick = (day: number) => {
        setSelectedDate(day);
    };

    const handleConfirm = () => {
        const selectedTime = timeSlots.find(slot => slot.selected);
        alert(`Đã xác nhận lịch hẹn: Ngày ${selectedDate}, lúc ${selectedTime?.time || 'chưa chọn giờ'}`);
    };

    return (
        <div className="appointment-container">
            {/* Header */}
            <header className="appointment-header">
                <h1>Transp dặt lịch hạn</h1>
                <p className="subtitle">The method of plug back-WILL...</p>
            </header>

            <main className="appointment-content">
                {/* Calendar Section */}
                <section className="calendar-section">
                    <h2>Dặt lịch hạn</h2>
                    <div className="calendar">
                        <div className="weekdays">
                            {daysOfWeek.map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="days-grid">
                            {daysInMonth.map(day => (
                                <div
                                    key={day}
                                    className={`day ${selectedDate === day ? 'selected' : ''}`}
                                    onClick={() => handleDateClick(day)}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Time Slots Section */}
                <section className="time-slots-section">
                    <h2>Xkung gió</h2>
                    <div className="time-slots">
                        {timeSlots.map(slot => (
                            <div
                                key={slot.id}
                                className={`time-slot ${slot.selected ? 'selected' : ''}`}
                                onClick={() => handleTimeSlotClick(slot.id)}
                            >
                                <div className="checkbox">
                                    {slot.selected && <div className="checkmark">✓</div>}
                                </div>
                                <span>{slot.time}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Appointment Type */}
                <section className="appointment-type-section">
                    <h2>Nay đón buổi hạn</h2>
                    <div className="type-options">
                        <div className="type-option">
                            <div className="type-indicator online"></div>
                            <span>Online</span>
                        </div>
                        <div className="type-option">
                            <div className="type-indicator offline"></div>
                            <span>Offline</span>
                        </div>
                    </div>
                </section>

                {/* Confirm Button */}
                <div className="confirm-section">
                    <button className="confirm-button" onClick={handleConfirm}>
                        Xác nhận
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AppointmentDetail;