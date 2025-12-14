import React from 'react';
import '../styles/MenteeProfile.css';
import { useNavigate } from 'react-router-dom';
interface ExperienceItem {
    role: string;
    company: string;
    from: string;
    to: string;
    current?: boolean;
}
interface EducationItem {
    role: string;
    school: string;
    from: string;
    to: string;
}
interface MenteeProfileProps {
    isOwner?: boolean;
}

const EXPERIENCES: ExperienceItem[] = [
    { role: 'Intern Marketing', company: 'TNHH Z', from: '06/2024', to: '10/2024', current: true },
];
const EDUCATIONS: EducationItem[] = [
    { role: 'Sinh viên năm cuối, Chuyên ngành Marketing', school: 'Đại học Kinh tế Quốc dân', from: '2021', to: '2025' },
];
const STRONG_SIDE = ['Phân tích dữ liệu Marketing', 'Tư duy chiến lược Digital', 'Sửa hồ sơ và tư duy chiến lược'];
const IMPROVE_SIDE = ['Kỹ năng thuyết trình', 'Quản lý thời gian', 'Kỹ năng làm việc nhóm'];
export default function menteeProfile({ isOwner = false }: MenteeProfileProps) {
    const navigate = useNavigate();
    return (
        <div className="mentee-profile-page">
            <div className="mentee-grid">
                {/* Left Primary Profile Card */}
                <section className="profile-card-large">
                    <header className="profile-header-row">
                        <div className="avatar-wrapper">
                            <img src="https://placehold.co/96x96" alt="mentee Avatar" className="avatar" />
                            <span className="status-dot" aria-label="Online" />
                        </div>
                        <div className="profile-header-info">
                            <h1 className="mentee-name">Nguyễn Minh Anh</h1>
                            <p className="mentee-meta">Location: Ha Noi </p>
                            {!isOwner && (
                                <div className="action-row">
                                    <button className="btn-primary" type="button" onClick={() => navigate('/chat')}>🤝Kết nối ngay</button>
                                    <button className="btn-ghost" type="button" onClick={() => navigate('/chat')}>
                                        <img src="/paper-plane.svg" alt="send" /> Gửi tin nhắn
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>
                    <div className="profile-body-section">
                        <section className="section-block">
                            <h2 className="section-title">Giới thiệu</h2>
                            <p className="intro-text">
                                Tôi là sinh viên năm cuối chuyên ngành Marketing, mục tiêu của tôi là trở thành một Digital Marketing Specialist trong 6 tháng tới. Tôi cần mentor giúp tôi xây dựng chiến lược, đọc hiểu các chỉ số hiệu suất, và chuẩn bị phỏng vấn vào các công ty lớn.
                            </p>
                        </section>
                        <section className="section-block">
                            <h2 className="section-title">Kinh nghiệm làm việc và thực tập</h2>
                            <ul className="experience-timeline">
                                {EXPERIENCES.map(exp => (
                                    <li key={exp.role} className="exp-item">
                                        <div className="exp-marker" />
                                        <div className="exp-content">
                                            <p className="exp-role">{exp.role}</p>
                                            <p className="exp-company">{exp.company}</p>
                                            <p className="exp-range">{exp.from} - {exp.to}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <div>
                            <section className="section-blocke">
                                <h2 className="section-title">Học vấn</h2>
                                <ul className="experience-timeline">
                                    {EDUCATIONS.map(exp => (
                                        <li key={exp.role} className="exp-item">
                                            <div />
                                            <div className="edu-content">
                                                <p className="exp-role">{exp.role}</p>
                                                <p className="exp-company">{exp.school}</p>
                                                <p className="exp-range">{exp.from} - {exp.to}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </section>


                {/* Right Column Cards */}
                <aside className="right-column">
                    <div className="skills-card">
                        <h3 className="skills-title">Lĩnh vực thế mạnh</h3>
                        <div className="skills-tags">
                            {STRONG_SIDE.map(s => (
                                <span key={s} className="skill-tag">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div className="skills-card">
                        <h3 className="skills-title">Kỹ năng cần cải thiện</h3>
                        <div className="skills-tags">
                            {IMPROVE_SIDE.map(s => (
                                <span key={s} className="skill-tag">{s}</span>
                            ))}
                        </div>
                    </div>
                    <div className="document-card">
                        <div className="document-header">
                            <div className="document">Tài liệu đính kèm</div>
                        </div>
                        <div>
                            <div className="stat-value">Mentee đã cung cấp tài liệu mới nhất của mình để bạn dễ dàng đánh giá</div>
                            <div className="button-container">
                                <a><button type="button" className="btn-link">Tải tài liệu</button></a>
                            </div>
                        </div>

                    </div>
                </aside>
            </div >
        </div >
    );
}