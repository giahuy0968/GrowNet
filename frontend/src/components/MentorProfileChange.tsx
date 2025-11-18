import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/MentorProfileChange.css'

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
        <div className="profile-setup-container">
            <div className="profile-setup-card">
                <h1 className="profile-title">HOÀN THIỆN HỒ SƠ CỦA BẠN</h1>
                <p className="profile-subtitle">Vui lòng điền thông tin để GrowNet kết nối bạn tốt hơn.</p>

                <form onSubmit={handleSubmit} className="profile-form" noValidate>
                    <div className="form-group">
                        <label>Họ và Tên</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            required
                        />
                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                            />
                            {errors.birthDate && <span className="error-text">{errors.birthDate}</span>}
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Chọn</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Vị trí hiện tại</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Hà Nội, TP. HCM..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Chức danh / Định hướng</label>
                        <input
                            type="text"
                            name="professionOrientation"
                            value={formData.professionOrientation}
                            onChange={handleChange}
                            placeholder="Frontend Developer..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Mục tiêu học tập</label>
                        <textarea
                            name="learningGoals"
                            value={formData.learningGoals}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Nắm vững React..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Kỹ năng cần cải thiện (Enter hoặc , để thêm)</label>
                        <div className="tag-input">
                            <input
                                type="text"
                                onKeyDown={e => handleTagKeyDown(e, 'skillsList')}
                                placeholder="Nhập và Enter..."
                            />
                            <div className="tag-list">
                                {formData.skillsList.map((t, i) => (
                                    <span key={i} className="tag">
                                        {t}
                                        <button type="button" onClick={() => removeTag('skillsList', i)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Lĩnh vực thế mạnh (Enter hoặc , để thêm)</label>
                        <div className="tag-input">
                            <input
                                type="text"
                                onKeyDown={e => handleTagKeyDown(e, 'expertiseList')}
                                placeholder="Nhập và Enter..."
                            />
                            <div className="tag-list">
                                {formData.expertiseList.map((t, i) => (
                                    <span key={i} className="tag">
                                        {t}
                                        <button type="button" onClick={() => removeTag('expertiseList', i)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Kinh nghiệm</label>
                        <textarea
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            rows={4}
                            placeholder="1 năm Frontend tại Công ty X..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Học vấn</label>
                        {formData.educationEntries.map((edu, idx) => (
                            <div key={idx} className="education-entry">
                                <input
                                    type="text"
                                    placeholder="Trường"
                                    value={edu.school}
                                    onChange={e => handleEducationChange(idx, 'school', e.target.value)}
                                    required
                                />
                                <select
                                    value={edu.degree}
                                    onChange={e => handleEducationChange(idx, 'degree', e.target.value)}
                                    required
                                >
                                    <option value="">Bậc</option>
                                    <option value="highschool">THPT</option>
                                    <option value="bachelor">Cử nhân</option>
                                    <option value="engineer">Kỹ sư</option>
                                    <option value="master">Thạc sĩ</option>
                                    <option value="phd">Tiến sĩ</option>
                                    <option value="other">Khác</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Chuyên ngành"
                                    value={edu.major}
                                    onChange={e => handleEducationChange(idx, 'major', e.target.value)}
                                />
                                <div className="date-row">
                                    <input
                                        type="text"
                                        placeholder="Năm bắt đầu"
                                        value={edu.startYear}
                                        onChange={e => handleEducationChange(idx, 'startYear', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Năm kết thúc"
                                        value={edu.endYear}
                                        onChange={e => handleEducationChange(idx, 'endYear', e.target.value)}
                                    />
                                </div>
                                {educationErrors[idx] && <span className="error-text">{educationErrors[idx]}</span>}
                                <button
                                    type="button"
                                    onClick={() => removeEducation(idx)}
                                    className="btn-dl"
                                >Xóa</button>
                            </div>
                        ))}
                        <button type="button" onClick={addEducation} className="btn-outline">+ Thêm học vấn</button>
                    </div>

                    <div className="form-group">
                        <label>Giới thiệu</label>
                        <textarea
                            name="introduction"
                            value={formData.introduction}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Chia sẻ ngắn gọn..."
                        />
                        {errors.introduction && <span className="error-text">{errors.introduction}</span>}
                    </div>

                    <div className="form-group">
                        <label>Vai trò</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn vai trò</option>
                            <option value="mentor">Mentor</option>
                            <option value="mentee">Mentee</option>
                        </select>
                        {errors.role && <span className="error-text">{errors.role}</span>}
                    </div>

                    <button type="submit" className="btn-submit">
                        ✓ LƯU & BẮT ĐẦU
                    </button>
                </form>
            </div>
        </div>
    )
}
