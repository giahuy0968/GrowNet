import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/MentorProfileChange.css'

type Experience = {
    positionCompany: string
    startMonth: string
    startYear: string
    endMonth: string
    endYear: string
}

export default function MentorProfileChange() {
    const navigate = useNavigate()

    const [fullName, setFullName] = useState('Nguyễn Minh Anh')
    const [city, setCity] = useState('TP.HCM')
    const [title, setTitle] = useState('Senior UX/UI Designer')
    const [intro, setIntro] = useState('Tôi là một nhà thiết kế giao diện người dùng với 5 năm kinh nghiệm làm việc tại các startup công nghệ phát triển nhanh...')
    const [coreSkillInput, setCoreSkillInput] = useState('')
    const [coreSkills, setCoreSkills] = useState<string[]>(['Figma', 'UX Research', 'UI Design'])
    const [experiences, setExperiences] = useState<Experience[]>([
        { positionCompany: 'Senior UX/UI Designer, CreativeLab', startMonth: '2019', startYear: 'Hiện tại', endMonth: '', endYear: '' }
    ])
    const [hourRate, setHourRate] = useState('200.000')

    const addSkill = () => {
        const v = coreSkillInput.trim()
        if (!v) return
        if (coreSkills.length >= 7) return
        if (coreSkills.some(s => s.toLowerCase() === v.toLowerCase())) return
        setCoreSkills(prev => [...prev, v])
        setCoreSkillInput('')
    }
    const onSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); addSkill()
        }
    }
    const removeSkill = (i: number) => setCoreSkills(prev => prev.filter((_, idx) => idx !== i))

    const addExp = () => setExperiences(prev => [...prev, { positionCompany: '', startMonth: '', startYear: '', endMonth: '', endYear: '' }])
    const removeExp = (i: number) => setExperiences(prev => prev.filter((_, idx) => idx !== i))
    const changeExp = (i: number, field: keyof Experience, value: string) => {
        setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
    }

    const close = () => navigate(-1)
    const save = () => { navigate(-1) }

    return (
        <div className="mpc-overlay">
            <div className="mpc-modal">
                <div className="mpc-header">
                    <span className="mpc-title">Chỉnh Sửa Hồ Sơ</span>
                    <button className="mpc-close" aria-label="Đóng" onClick={close}>×</button>
                </div>

                <div className="mpc-body">
                    <div className="mpc-avatar-row">
                        <div className="mpc-avatar" aria-hidden="true">👤</div>
                        <button type="button" className="btn-light">Đổi ảnh đại diện</button>
                    </div>

                    <div className="mpc-field">
                        <label>Họ và Tên</label>
                        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Minh Anh" />
                    </div>

                    <div className="mpc-grid2">
                        <div className="mpc-field">
                            <label>Vị trí hiện tại (Thành phố)</label>
                            <input value={city} onChange={e => setCity(e.target.value)} placeholder="TP.HCM" />
                        </div>
                        <div className="mpc-field">
                            <label>Chức danh / Vị trí hiện tại</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Senior UX/UI Designer" />
                        </div>
                    </div>

                    <div className="mpc-field">
                        <label>Giới thiệu bản thân và Mục tiêu Mentoring</label>
                        <textarea value={intro} onChange={e => setIntro(e.target.value)} placeholder="Viết giới thiệu..." />
                    </div>

                    <div className="mpc-field">
                        <label>Kỹ năng CỐT LÕI (tối đa 7)</label>
                        <input
                            value={coreSkillInput}
                            onChange={e => setCoreSkillInput(e.target.value)}
                            onKeyDown={onSkillKey}
                            placeholder="Figma, UX Research, ... (Enter để thêm)"
                        />
                        <div className="mpc-chips">
                            {coreSkills.map((s, i) => (
                                <span key={s} className="chip">{s}<button type="button" onClick={() => removeSkill(i)}>×</button></span>
                            ))}
                        </div>
                        <small className="hint">Mỗi kỹ năng, vui lòng enter để thêm; tối đa 7, ưu tiên đúng bản chất Mentoring.</small>
                    </div>

                    <div className="mpc-group-card">
                        <div className="mpc-group-title">Kinh nghiệm làm việc</div>
                        {experiences.map((e, idx) => (
                            <div key={idx} className="mpc-exp-row">
                                <div className="mpc-field">
                                    <label>Chức danh & Công ty</label>
                                    <input value={e.positionCompany} onChange={ev => changeExp(idx, 'positionCompany', ev.target.value)} placeholder="Senior UX/UI Designer, CreativeLab" />
                                </div>
                                <div className="mpc-grid3">
                                    <div className="mpc-field"><label>Bắt đầu (Tháng/Năm)</label><input value={e.startMonth} onChange={ev => changeExp(idx, 'startMonth', ev.target.value)} placeholder="2019" /></div>
                                    <div className="mpc-field"><label>Kết thúc (Tháng/Năm)</label><input value={e.startYear} onChange={ev => changeExp(idx, 'startYear', ev.target.value)} placeholder="Hiện tại" /></div>
                                    <div className="mpc-exp-actions">
                                        <button type="button" className="btn-icon" aria-label="Xóa" onClick={() => removeExp(idx)}>🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="mpc-actions-line">
                            <button type="button" className="btn-outline" onClick={addExp}>Thêm</button>
                        </div>
                    </div>

                    <div className="mpc-field fee-field">
                        <label>Phí mentoring (áp dụng cho các buổi cố vấn cá nhân)</label>
                        <div className="fee-input">
                            <input value={hourRate} onChange={e => setHourRate(e.target.value)} placeholder="200.000" />
                            <span>VND/Giờ</span>
                        </div>
                    </div>
                </div>

                <div className="mpc-footer">
                    <button type="button" className="btn-danger" onClick={close}>HỦY</button>
                    <button type="button" className="btn-success" onClick={save}>✓ LƯU THAY ĐỔI</button>
                </div>
            </div>
        </div>
    )
}
