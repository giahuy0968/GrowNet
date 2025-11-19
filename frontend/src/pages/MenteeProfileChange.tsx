import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/MenteeProfileChange.css'

type EducationEntry = {
    school: string
    degree: string
    major: string
    startYear: string
    endYear: string
}
type FormData = {
    fullName: string
    location: string
    professionOrientation: string
    learningGoals: string
    experience: string
    introduction: string
    birthDate: string
    gender: string
    role: string
    educationEntries: EducationEntry[]
    skillsList: string[]
    expertiseList: string[]
}

export default function ProfileSetup() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        location: '',
        professionOrientation: '',
        learningGoals: '',
        experience: '',
        introduction: '',
        birthDate: '',
        gender: '',
        role: '',
        educationEntries: [],
        skillsList: [],
        expertiseList: []
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [educationErrors, setEducationErrors] = useState<string[]>([])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Tag input
    const handleTagKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        key: 'skillsList' | 'expertiseList'
    ) => {
        const value = (e.target as HTMLInputElement).value.trim()
        if ((e.key === 'Enter' || e.key === ',') && value) {
            e.preventDefault()
            setFormData(prev => ({ ...prev, [key]: [...prev[key], value] }))
                ; (e.target as HTMLInputElement).value = ''
        }
    }

    const removeTag = (key: 'skillsList' | 'expertiseList', idx: number) => {
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== idx)
        }))
    }

    // Education list handlers
    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            educationEntries: [
                ...prev.educationEntries,
                { school: '', degree: '', major: '', startYear: '', endYear: '' }
            ]
        }))
        setEducationErrors(prev => [...prev, ''])
    }

    const removeEducation = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            educationEntries: prev.educationEntries.filter((_, i) => i !== idx)
        }))
        setEducationErrors(prev => prev.filter((_, i) => i !== idx))
    }

    const handleEducationChange = (
        idx: number,
        field: keyof EducationEntry,
        value: string
    ) => {
        setFormData(prev => {
            const copy = [...prev.educationEntries]
            copy[idx] = { ...copy[idx], [field]: value }
            return { ...prev, educationEntries: copy }
        })
        setEducationErrors(prev => {
            const copy = [...prev]
            copy[idx] = ''
            return copy
        })
    }

    // Validation
    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.fullName.trim()) newErrors.fullName = 'Bắt buộc'
        if (!formData.role) newErrors.role = 'Bắt buộc'
        if (formData.birthDate) {
            const d = new Date(formData.birthDate)
            if (d > new Date()) newErrors.birthDate = 'Ngày không hợp lệ'
        }
        if (formData.introduction.length > 500) newErrors.introduction = 'Tối đa 500 ký tự'

        const eduErrs = formData.educationEntries.map(e => {
            if (!e.school.trim()) return 'Thiếu trường'
            if (!e.degree) return 'Thiếu bậc'
            if (e.startYear && e.endYear && e.startYear > e.endYear) return 'Năm không hợp lệ'
            return ''
        })

        setErrors(newErrors)
        setEducationErrors(eduErrs)
        return Object.keys(newErrors).length === 0 && eduErrs.every(m => m === '')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        // TODO: Gửi formData tới API (POST /api/profile)
        // console.log(formData)
        navigate('/dashboard')
    }

    return (
        <div className="mpc-overlay">
            <div className="mpc-modal">

                {/* HEADER */}
                <div className="mpc-header">
                    <span className="mpc-title">Hoàn Thiện Hồ Sơ Cá Nhân</span>
                    <button className="mpc-close" aria-label="Đóng" onClick={close}>×</button>
                </div>

                {/* BODY */}
                <div className="mpc-body">

                    {/* Avatar */}
                    <div className="mpc-avatar-row">
                        <div className="mpc-avatar">👤</div>
                        <button type="button" className="btn-light">Đổi ảnh đại diện</button>
                    </div>

                    {/* Họ tên */}
                    <div className="mpc-field">
                        <label>Họ và Tên</label>
                        <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                        />
                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </div>

                    {/* Ngày sinh + Giới tính */}
                    <div className="mpc-grid2">
                        <div className="mpc-field">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                            />
                            {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
                        </div>

                        <div className="mpc-field">
                            <label>Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Chọn</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="mpc-field">
                        <label>Vị trí hiện tại</label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Hà Nội, TP.HCM..."
                        />
                    </div>

                    {/* Định hướng nghề nghiệp */}
                    <div className="mpc-field">
                        <label>Chức danh / Định hướng nghề nghiệp</label>
                        <input
                            name="professionOrientation"
                            value={formData.professionOrientation}
                            onChange={handleChange}
                            placeholder="Frontend Developer..."
                        />
                    </div>

                    {/* Mục tiêu học tập */}
                    <div className="mpc-field">
                        <label>Mục tiêu học tập</label>
                        <textarea
                            name="learningGoals"
                            value={formData.learningGoals}
                            onChange={handleChange}
                            placeholder="Nắm vững React..."
                            rows={3}
                        />
                    </div>

                    {/* Kỹ năng cần cải thiện */}
                    <div className="mpc-field">
                        <label>Kỹ năng cần cải thiện (Enter để thêm)</label>

                        <input
                            onKeyDown={(e) => handleTagKeyDown(e, "skillsList")}
                            placeholder="Nhập kỹ năng..."
                        />

                        <div className="mpc-chips">
                            {formData.skillsList.map((t, i) => (
                                <span key={i} className="chip">
                                    {t}
                                    <button type="button" onClick={() => removeTag("skillsList", i)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Lĩnh vực thế mạnh */}
                    <div className="mpc-field">
                        <label>Lĩnh vực thế mạnh (Enter để thêm)</label>

                        <input
                            onKeyDown={(e) => handleTagKeyDown(e, "expertiseList")}
                            placeholder="Thiết kế UI, Backend..."
                        />

                        <div className="mpc-chips">
                            {formData.expertiseList.map((t, i) => (
                                <span key={i} className="chip">
                                    {t}
                                    <button type="button" onClick={() => removeTag("expertiseList", i)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Kinh nghiệm tóm tắt */}
                    <div className="mpc-field">
                        <label>Kinh nghiệm</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            rows={4}
                            placeholder="1 năm Frontend tại công ty X..."
                        />
                    </div>

                    {/* Học vấn – Card Group */}
                    <div className="mpc-group-card">
                        <div className="mpc-group-title">Học vấn</div>

                        {formData.educationEntries.map((edu, idx) => (
                            <div className="mpc-exp-row" key={idx}>

                                <div className="mpc-field">
                                    <label>Trường</label>
                                    <input
                                        value={edu.school}
                                        onChange={(e) => handleEducationChange(idx, "school", e.target.value)}
                                    />
                                </div>

                                <div className="mpc-field">
                                    <label>Bậc học</label>
                                    <select
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                                    >
                                        <option value="">Chọn</option>
                                        <option value="bachelor">Cử nhân</option>
                                        <option value="engineer">Kỹ sư</option>
                                        <option value="master">Thạc sĩ</option>
                                        <option value="phd">Tiến sĩ</option>
                                    </select>
                                </div>

                                <div className="mpc-field">
                                    <label>Chuyên ngành</label>
                                    <input
                                        value={edu.major}
                                        onChange={(e) => handleEducationChange(idx, "major", e.target.value)}
                                    />
                                </div>

                                <div className="mpc-grid2">
                                    <div className="mpc-field">
                                        <label>Bắt đầu</label>
                                        <input
                                            value={edu.startYear}
                                            onChange={(e) => handleEducationChange(idx, "startYear", e.target.value)}
                                        />
                                    </div>
                                    <div className="mpc-field">
                                        <label>Kết thúc</label>
                                        <input
                                            value={edu.endYear}
                                            onChange={(e) => handleEducationChange(idx, "endYear", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {educationErrors[idx] && (
                                    <span className="error-text">{educationErrors[idx]}</span>
                                )}

                                <button type="button" className="btn-icon" onClick={() => removeEducation(idx)}>
                                    🗑️
                                </button>
                            </div>
                        ))}

                        <button type="button" className="btn-outline" onClick={addEducation}>
                            + Thêm học vấn
                        </button>
                    </div>

                    {/* Giới thiệu */}
                    <div className="mpc-field">
                        <label>Giới thiệu bản thân</label>
                        <textarea
                            name="introduction"
                            value={formData.introduction}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Chia sẻ ngắn gọn..."
                        />
                    </div>

                    {/* Vai trò */}
                    <div className="mpc-field">
                        <label>Vai trò</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="">Chọn vai trò</option>
                            <option value="mentor">Mentor</option>
                            <option value="mentee">Mentee</option>
                        </select>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mpc-footer">
                    <button type="button" className="btn-danger" onClick={close}>HỦY</button>
                    <button type="submit" className="btn-success" onClick={handleSubmit}>
                        ✓ LƯU & BẮT ĐẦU
                    </button>
                </div>

            </div>
        </div>
    )

}
